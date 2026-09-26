#!/usr/bin/env python3
"""
seed_from_csv.py — convert a verified-batch CSV into a Supabase-ready SQL file.

Usage:
    python3 seed_from_csv.py batch_1.csv > 001_batch_1_seed.sql
    # then paste the .sql output into the Supabase SQL editor

    python3 seed_from_csv.py --dry-run batch_1.csv
    # parse + validate only; emits no SQL and prints, per consultant, what
    # the import would change versus the live database

The script never writes to the database itself; it only emits SQL. Valid
language codes are read from the live Supabase `languages` table at runtime
(NEXT_PUBLIC_SUPABASE_URL + a key, from the environment or .env.local). Any
language that isn't a mapped name or a valid code aborts the run before any
SQL is emitted.

The script is idempotent — re-running with the same CSV is safe because every
INSERT uses ON CONFLICT DO UPDATE keyed on the natural unique field
(rcic_number for consultants, place_id for businesses).

CSV column order expected (no header row, matching batch_1):
  name, phone, website, street, city, consultant_name, rcic_number,
  language, postal_code, address, category, subtypes, email,
  latitude, longitude, rating, reviews, reviews_link,
  business_status, working_hours, place_id
"""
import csv
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

# ---------------- Controlled vocab ----------------
# CSV language name -> code. Every code must exist in the live `languages`
# table (checked at startup). To support a new language, add its row to the
# table first, then map its name(s) here.
LANGUAGE_MAP = {
    'english': 'en', 'french': 'fr', 'français': 'fr',
    'spanish': 'es', 'español': 'es',
    'punjabi': 'pa', 'hindi': 'hi', 'urdu': 'ur',
    'chinese': 'zh', 'mandarin': 'zh', 'cantonese': 'yue',
    'arabic': 'ar', 'tagalog': 'tl', 'filipino': 'tl', 'visayan': 'tl',
    'turkish': 'tr', 'portuguese': 'pt',
    'vietnamese': 'vi', 'korean': 'ko', 'russian': 'ru',
    'ukrainian': 'uk', 'persian': 'fa', 'farsi': 'fa',
    'amharic': 'am', 'somali': 'so',
    'serbian': 'sr', 'croatian': 'hr', 'gujarati': 'gu', 'yoruba': 'yo',
    'czech': 'cs', 'slovak': 'sk',
}

CITY_MAP = {
    'calgary': 'calgary',
    'edmonton': 'edmonton',
    'red deer': 'red-deer',
}

RCIC_RE = re.compile(r'^R\d{5,7}$')
RCIC_SPLIT_RE = re.compile(r'[,\s]+')


# ---------------- Supabase (read-only) ----------------
def load_env():
    """Environment first, then .env.local next to this script."""
    env = {}
    env_file = Path(__file__).resolve().parent / '.env.local'
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    env.update({k: v for k, v in os.environ.items() if v})
    url = env.get('NEXT_PUBLIC_SUPABASE_URL')
    # Service role sees draft consultants too (needed for an accurate diff);
    # the anon key is enough for the languages table.
    key = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if not url or not key:
        sys.exit('ABORT: NEXT_PUBLIC_SUPABASE_URL and a Supabase key are required '
                 '(environment or .env.local) to read valid language codes.')
    return url.rstrip('/'), key


def supabase_get(url, key, table, params):
    """GET /rest/v1/<table>, following PostgREST pagination. Read-only."""
    rows, offset, page = [], 0, 1000
    while True:
        q = urllib.parse.urlencode({**params, 'limit': page, 'offset': offset})
        req = urllib.request.Request(
            f'{url}/rest/v1/{table}?{q}',
            headers={'apikey': key, 'Authorization': f'Bearer {key}'},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            batch = json.load(resp)
        rows.extend(batch)
        if len(batch) < page:
            return rows
        offset += page


def fetch_valid_language_codes(url, key):
    try:
        rows = supabase_get(url, key, 'languages', {'select': 'code'})
    except Exception as e:  # noqa: BLE001 — any failure means we can't validate
        sys.exit(f'ABORT: could not read the languages table: {e}')
    codes = {r['code'] for r in rows}
    if not codes:
        sys.exit('ABORT: the languages table returned no codes.')
    stale = sorted({c for c in LANGUAGE_MAP.values() if c not in codes})
    if stale:
        sys.exit(f'ABORT: LANGUAGE_MAP uses codes missing from the languages table: {stale}')
    return codes


# ---------------- Helpers ----------------
def sql_str(v):
    """Escape a value for inline SQL (we're generating a file, not parameterizing)."""
    if v is None or v == '' or (isinstance(v, str) and v.strip().lower() == 'nan'):
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v).strip().replace("'", "''")
    return f"'{s}'"


def sql_array(items):
    """Postgres text[] literal."""
    if not items:
        return "'{}'::text[]"
    inner = ','.join('"' + str(i).replace('"', '\\"') + '"' for i in items)
    return f"'{{{inner}}}'::text[]"


def slugify(text):
    s = re.sub(r'[^a-z0-9]+', '-', (text or '').lower()).strip('-')
    return s or 'unknown'


def make_consultant_slug(full_name, rcic_number):
    return f"{slugify(full_name)}-{rcic_number.lower()}"


def make_business_slug(name, city_slug):
    return f"{slugify(name)}-{city_slug}"


def parse_languages(raw, valid_codes):
    """
    'English, Spanish, Tagalog' → ['en','es','tl']
    A part may be a mapped language name or a valid code as-is ('sr').
    Anything else is returned in `unknown`; the caller aborts on it.
    """
    if not raw:
        return ['en'], []
    parts = re.split(r'[,/&;]|\band\b', str(raw).lower())
    codes, unknown = [], []
    for p in parts:
        p = p.strip(' .')
        if not p:
            continue
        code = LANGUAGE_MAP.get(p) or (p if p in valid_codes else None)
        if code is None:
            unknown.append(p)
        elif code not in codes:
            codes.append(code)
    return codes or ['en'], unknown


def split_rcic_numbers(raw):
    """'R422591, R710316, R710331' → ['R422591','R710316','R710331']"""
    if not raw:
        return []
    parts = [p.strip() for p in RCIC_SPLIT_RE.split(str(raw)) if p.strip()]
    valid = [p for p in parts if RCIC_RE.match(p)]
    return valid


def is_suspicious_website(url):
    if not url:
        return False, None
    bad = ['square.site', 'calendly.com', 'sites.google', 'wixsite', 'mystore']
    for pat in bad:
        if pat in url.lower():
            return True, pat
    return False, None


# ---------------- Main ----------------
def main(csv_path: str, dry_run: bool = False):
    sb_url, sb_key = load_env()
    valid_codes = fetch_valid_language_codes(sb_url, sb_key)

    cols = ['name','phone','website','street','city','consultant_name','rcic_number',
            'language','postal_code','address','category','subtypes','email',
            'latitude','longitude','rating','reviews','reviews_link',
            'business_status','working_hours','place_id']

    rows = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        for raw in reader:
            if len(raw) < len(cols):
                raw = raw + [''] * (len(cols) - len(raw))
            rows.append(dict(zip(cols, raw)))

    # Stats
    skipped = []
    flagged_websites = []
    unknown_languages = []  # (business, consultant, rcic cell, raw value, bad parts)
    parsed_consultants = []  # (rcic, name, city_slug, lang_codes) for --dry-run

    # Output collectors
    business_inserts = []
    consultant_inserts = []
    join_inserts = []

    # De-dupe: a business is one row per place_id; we may already have
    # consultants from a previous batch, so use ON CONFLICT to be safe.
    seen_place_ids = set()
    # Track which RCICs we've already linked to a business in THIS batch.
    # When a consultant appears at multiple firms (e.g. one RCIC working at two
    # locations of the same firm group), only the FIRST link gets is_primary=true.
    seen_rcic_primary = set()

    # Audit batch
    batch_id = str(uuid.uuid4())
    batch_label = Path(csv_path).stem  # e.g. "batch_1_-_Sheet1__1_"
    batch_insert = (
        f"insert into import_batches (id, source_label, imported_count, imported_by, notes)\n"
        f"  values ('{batch_id}', {sql_str(batch_label)}, {{COUNT}}, 'manual-cli', "
        f"{sql_str('Generated by seed_from_csv.py')});"
    )

    consultant_count = 0

    for r in rows:
        rcic_raw = (r.get('rcic_number') or '').strip()
        rcic_list = split_rcic_numbers(rcic_raw)

        if not rcic_list:
            skipped.append((r.get('name'), 'no valid RCIC after parsing: ' + repr(rcic_raw)))
            continue

        # ---- Business ----
        place_id = (r.get('place_id') or '').strip()
        city_raw = (r.get('city') or '').strip().lower()
        city_slug = CITY_MAP.get(city_raw)
        if not city_slug:
            skipped.append((r.get('name'), f'unknown city: {city_raw}'))
            continue

        if place_id and place_id not in seen_place_ids:
            seen_place_ids.add(place_id)
            biz_slug = make_business_slug(r.get('name', ''), city_slug)
            sus, sus_reason = is_suspicious_website(r.get('website'))
            if sus:
                flagged_websites.append((r.get('name'), sus_reason, r.get('website')))

            has_office = bool((r.get('street') or '').strip()) and not sus

            biz_id = str(uuid.uuid4())
            r['_business_id'] = biz_id  # stash for join

            business_inserts.append(f"""
insert into businesses (
    id, slug, legal_name, display_name, city_slug,
    address, lat, lng, phone, website, email,
    has_physical_office, google_place_id
) values (
    '{biz_id}',
    {sql_str(biz_slug)},
    {sql_str(r.get('name'))},
    {sql_str(r.get('name'))},
    {sql_str(city_slug)},
    {sql_str(r.get('address'))},
    {sql_str(r.get('latitude') or None)},
    {sql_str(r.get('longitude') or None)},
    {sql_str(r.get('phone'))},
    {sql_str(r.get('website'))},
    {sql_str(r.get('email'))},
    {sql_str(has_office)},
    {sql_str(place_id)}
)
on conflict (google_place_id) do update set
    phone = excluded.phone,
    website = excluded.website,
    email = excluded.email,
    address = excluded.address,
    has_physical_office = excluded.has_physical_office,
    updated_at = now()
returning id;
""".strip())
        elif place_id in seen_place_ids:
            # Same business already in this batch (shouldn't happen post-dedup but defensive)
            r['_business_id'] = None  # signal: look up at runtime; we'll skip the join
            skipped.append((r.get('name'), f'duplicate place_id in batch: {place_id}'))
            continue
        else:
            r['_business_id'] = None

        # ---- Consultants (one row per RCIC in the cell) ----
        full_name = (r.get('consultant_name') or '').strip()
        if not full_name:
            skipped.append((r.get('name'), 'no consultant_name'))
            continue

        lang_codes, unknown = parse_languages(r.get('language'), valid_codes)
        if unknown:
            unknown_languages.append(
                (r.get('name'), full_name, rcic_raw, r.get('language'), unknown))

        # If the firm has multiple RCICs but one consultant_name, we can only
        # confidently attribute the consultant_name to the first RCIC.
        # The other RCICs get a placeholder name flagged for manual fix.
        for idx, rcic in enumerate(rcic_list):
            consultant_count += 1
            if idx == 0:
                cname = full_name
                given = full_name.split()[0] if full_name else None
                family = full_name.split()[-1] if len(full_name.split()) > 1 else None
            else:
                # Multi-RCIC firm: subsequent RCICs need a manual fill-in
                cname = f'(Pending name) — colleague at {r.get("name")}'
                given = None
                family = None
                skipped.append((rcic, f'placeholder name; manual fill needed for {r.get("name")}'))

            parsed_consultants.append((rcic, cname, city_slug, lang_codes))
            slug = make_consultant_slug(cname, rcic)
            cid = str(uuid.uuid4())

            consultant_inserts.append(f"""
insert into consultants (
    id, rcic_number, slug, full_name, given_name, family_name,
    licence_type, cicc_status, cicc_verified_on,
    primary_city_slug, language_codes, service_slugs, status, import_batch_id
) values (
    '{cid}',
    {sql_str(rcic)},
    {sql_str(slug)},
    {sql_str(cname)},
    {sql_str(given)},
    {sql_str(family)},
    'RCIC',
    'Active',
    current_date,
    {sql_str(city_slug)},
    {sql_array(lang_codes)},
    '{{}}'::text[],
    'draft',
    '{batch_id}'
)
on conflict (rcic_number) do update set
    full_name = excluded.full_name,
    language_codes = excluded.language_codes,
    primary_city_slug = excluded.primary_city_slug,
    updated_at = now()
returning id;
""".strip())

            # Join row
            if r.get('_business_id'):
                # is_primary only true if this is the FIRST business we link
                # this consultant to in the batch AND it's the first RCIC of a
                # multi-RCIC firm row.
                is_primary_link = (idx == 0) and (rcic not in seen_rcic_primary)
                if is_primary_link:
                    seen_rcic_primary.add(rcic)

                # Belt-and-suspenders: even with the seen-set logic above, the
                # WHERE NOT EXISTS clause prevents the unique-primary constraint
                # from firing if the consultant already has a primary business
                # from a prior batch.
                join_inserts.append(f"""
insert into consultant_businesses (consultant_id, business_id, is_primary, role_label)
select c.id, b.id,
       {'true' if is_primary_link else 'false'} and not exists (
           select 1 from consultant_businesses cb2
           where cb2.consultant_id = c.id and cb2.is_primary = true
       ),
       {sql_str('Lead Consultant' if is_primary_link else 'Consultant')}
from consultants c, businesses b
where c.rcic_number = {sql_str(rcic)}
  and b.google_place_id = {sql_str(place_id)}
on conflict (consultant_id, business_id) do nothing;
""".strip())

    # ---------------- Validate before emitting anything ----------------
    if unknown_languages:
        print(f"ABORT: {len(unknown_languages)} row(s) have languages that are neither "
              f"in LANGUAGE_MAP nor valid codes in the languages table. No SQL emitted.",
              file=sys.stderr)
        for biz, cname, rcic_cell, raw, bad in unknown_languages:
            print(f"  - {cname or '(no name)'} [{rcic_cell}] at {biz}: "
                  f"{', '.join(repr(b) for b in bad)}  (raw: {raw!r})", file=sys.stderr)
        if not dry_run:
            sys.exit(1)

    if dry_run:
        # Still show the diff (unknown languages excluded) so the failures can
        # be judged in context; exit non-zero if validation failed.
        report_dry_run(sb_url, sb_key, parsed_consultants, len(business_inserts),
                       seen_place_ids, skipped, flagged_websites)
        sys.exit(1 if unknown_languages else 0)

    # ---------------- Emit ----------------
    print("-- Generated by seed_from_csv.py")
    print(f"-- Source: {csv_path}")
    print(f"-- Consultants: {consultant_count}  Businesses: {len(business_inserts)}")
    print(f"-- Run AFTER migration_001_pre_import.sql\n")
    print("begin;\n")
    print("-- 1) Audit batch")
    print(batch_insert.replace("{COUNT}", str(consultant_count)))
    print()
    print("-- 2) Businesses")
    for s in business_inserts:
        print(s)
        print()
    print("-- 3) Consultants")
    for s in consultant_inserts:
        print(s)
        print()
    print("-- 4) Consultant ↔ Business joins")
    for s in join_inserts:
        print(s)
        print()
    print("commit;\n")

    # Stderr report
    print("\n=== IMPORT REPORT ===", file=sys.stderr)
    print(f"Generated {consultant_count} consultant inserts across {len(business_inserts)} businesses.", file=sys.stderr)

    if flagged_websites:
        print(f"\n{len(flagged_websites)} suspicious websites (review before publishing):", file=sys.stderr)
        for name, reason, url in flagged_websites:
            print(f"  - {name}: [{reason}] {url}", file=sys.stderr)

    if skipped:
        print(f"\n{len(skipped)} skipped rows / placeholders:", file=sys.stderr)
        for name, reason in skipped:
            print(f"  - {name}: {reason}", file=sys.stderr)


def report_dry_run(url, key, parsed, business_count, place_ids, skipped, flagged):
    """Print what the import would change versus the live DB. Reads only."""
    existing = {
        c['rcic_number']: c
        for c in supabase_get(url, key, 'consultants', {
            'select': 'rcic_number,full_name,primary_city_slug,language_codes,status'})
    }
    known_places = {
        b['google_place_id']
        for b in supabase_get(url, key, 'businesses', {'select': 'google_place_id'})
        if b.get('google_place_id')
    }

    # A consultant can appear on several rows; the last row wins in SQL.
    final = {}
    for rcic, name, city, langs in parsed:
        final[rcic] = (name, city, langs)

    new, changed, unchanged, removals = [], [], 0, 0
    for rcic, (name, city, langs) in final.items():
        cur = existing.get(rcic)
        if cur is None:
            new.append((rcic, name, city, langs))
            continue
        cur_langs = cur.get('language_codes') or []
        added = [l for l in langs if l not in cur_langs]
        removed = [l for l in cur_langs if l not in langs]
        diffs = []
        if added:
            diffs.append(f"languages +{added}")
        if removed:
            diffs.append(f"languages -{removed}")
            removals += 1
        if name != cur.get('full_name'):
            diffs.append(f"full_name {cur.get('full_name')!r} -> {name!r}")
        if city != cur.get('primary_city_slug'):
            diffs.append(f"primary_city_slug {cur.get('primary_city_slug')!r} -> {city!r}")
        if diffs:
            changed.append((rcic, cur.get('full_name'), cur.get('status'), diffs))
        else:
            unchanged += 1

    print("=== DRY RUN — no SQL emitted, nothing written ===")
    print(f"Consultants in CSV: {len(final)} unique RCICs "
          f"({len(new)} new, {len(changed)} changed, {unchanged} unchanged)")
    print(f"Consultants whose languages would be REMOVED: {removals}")
    new_places = [p for p in place_ids if p not in known_places]
    print(f"Businesses in CSV: {business_count} ({len(new_places)} new place_ids)")

    if changed:
        print(f"\nChanged ({len(changed)}):")
        for rcic, name, status, diffs in sorted(changed):
            print(f"  - {rcic} {name} [{status}]: " + "; ".join(diffs))
    if new:
        print(f"\nNew ({len(new)}):")
        for rcic, name, city, langs in sorted(new):
            print(f"  - {rcic} {name} ({city}) languages={langs}")
    if flagged:
        print(f"\n{len(flagged)} suspicious websites:")
        for name, reason, site in flagged:
            print(f"  - {name}: [{reason}] {site}")
    if skipped:
        print(f"\n{len(skipped)} skipped rows / placeholders:")
        for name, reason in skipped:
            print(f"  - {name}: {reason}")


if __name__ == '__main__':
    args = sys.argv[1:]
    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']
    if len(args) != 1:
        print("Usage: python3 seed_from_csv.py [--dry-run] <batch.csv>", file=sys.stderr)
        sys.exit(1)
    main(args[0], dry_run=dry_run)
