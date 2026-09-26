#!/usr/bin/env python3
"""
seed_from_csv.py — convert a verified-batch CSV into a Supabase-ready SQL file.

Usage:
    python3 seed_from_csv.py batch_1.csv > 001_batch_1_seed.sql
    # then paste the .sql output into the Supabase SQL editor

    python3 seed_from_csv.py --merge-languages batch_1.csv > seed.sql
    # also add CSV languages to existing consultants (union, never removes)

    python3 seed_from_csv.py --dry-run [--merge-languages] batch_1.csv
    # parse + validate only; emits no SQL and prints what the import would
    # change versus the live database

The database is the source of truth; an import never degrades existing data:
  - Default mode inserts new consultants and businesses only. Existing rows
    (same rcic_number / google_place_id) get no UPDATE.
  - --merge-languages sets an existing consultant's language_codes to the
    union of the database value and the CSV value. Nothing else is updated,
    and no code is ever removed.
  - full_name and primary_city_slug are never updated for existing
    consultants, in any mode.

The script never writes to the database itself; it only emits SQL. Language
names are matched case-insensitively against the live `languages` table's
name_en column (plus LANGUAGE_ALIASES), read at runtime via
NEXT_PUBLIC_SUPABASE_URL + a key from the environment or .env.local. Any
language that can't be resolved aborts the run before any SQL is emitted.

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
# Only names that differ from a `languages.name_en` label. Everything else is
# resolved from the table itself, so a new language needs only a table row.
LANGUAGE_ALIASES = {
    'français': 'fr',
    'español': 'es',
    'mandarin': 'zh',
    'filipino': 'tl',
    'farsi': 'fa',
    'ndebele': 'nd',  # table label is "North Ndebele"
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
                 '(environment or .env.local) to read the languages table.')
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


def fetch_language_lookup(url, key):
    """
    Returns (valid_codes, name_to_code). name_to_code holds lower-cased
    name_en labels plus any alias whose target code exists in the table.
    """
    try:
        rows = supabase_get(url, key, 'languages', {'select': 'code,name_en'})
    except Exception as e:  # noqa: BLE001 — any failure means we can't validate
        sys.exit(f'ABORT: could not read the languages table: {e}')
    if not rows:
        sys.exit('ABORT: the languages table returned no rows.')

    valid_codes = {r['code'] for r in rows}
    name_to_code = {r['name_en'].strip().lower(): r['code'] for r in rows if r.get('name_en')}

    for alias, code in LANGUAGE_ALIASES.items():
        if alias in name_to_code and name_to_code[alias] != code:
            sys.exit(f'ABORT: alias {alias!r} -> {code!r} conflicts with table label '
                     f'{alias!r} -> {name_to_code[alias]!r}.')
        if code in valid_codes:
            name_to_code[alias] = code
        else:
            # Leave the alias out; rows using that name then fail validation.
            print(f'note: alias {alias!r} -> {code!r} inactive '
                  f'({code!r} is not in the languages table yet)', file=sys.stderr)
    return valid_codes, name_to_code


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


def parse_languages(raw, valid_codes, name_to_code):
    """
    'English, Spanish, Tagalog' → ['en','es','tl']
    A part may be a table label, an alias, or a valid code as-is ('sr').
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
        code = name_to_code.get(p) or (p if p in valid_codes else None)
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
def main(csv_path: str, dry_run: bool = False, merge_languages: bool = False):
    mode = 'merge-languages' if merge_languages else 'insert-only (default)'
    sb_url, sb_key = load_env()
    valid_codes, name_to_code = fetch_language_lookup(sb_url, sb_key)

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
    # (rcic, name, city_slug, lang_codes, languages_attributed) for --dry-run
    parsed_consultants = []

    # Output collectors
    business_inserts = []
    consultant_inserts = []
    join_inserts = []

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
        f"{sql_str(f'Generated by seed_from_csv.py ({mode})')});"
    )

    consultant_count = 0

    for r in rows:
        rcic_raw = (r.get('rcic_number') or '').strip()
        rcic_list = split_rcic_numbers(rcic_raw)

        if not rcic_list:
            skipped.append((r.get('name'), 'no valid RCIC after parsing: ' + repr(rcic_raw)))
            continue

        # ---- Business (insert-only; existing businesses are left untouched) ----
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
on conflict (google_place_id) do nothing;
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

        lang_codes, unknown = parse_languages(r.get('language'), valid_codes, name_to_code)
        if unknown:
            unknown_languages.append(
                (r.get('name'), full_name, rcic_raw, r.get('language'), unknown))

        # If the firm has multiple RCICs but one consultant_name, we can only
        # confidently attribute the consultant_name (and the row's languages)
        # to the first RCIC. The other RCICs get a placeholder name flagged for
        # manual fix, and are never language-merged.
        for idx, rcic in enumerate(rcic_list):
            consultant_count += 1
            attributed = idx == 0
            if attributed:
                cname = full_name
                given = full_name.split()[0] if full_name else None
                family = full_name.split()[-1] if len(full_name.split()) > 1 else None
            else:
                # Multi-RCIC firm: subsequent RCICs need a manual fill-in
                cname = f'(Pending name) — colleague at {r.get("name")}'
                given = None
                family = None
                skipped.append((rcic, f'placeholder name; manual fill needed for {r.get("name")}'))

            parsed_consultants.append((rcic, cname, city_slug, lang_codes, attributed))
            slug = make_consultant_slug(cname, rcic)
            cid = str(uuid.uuid4())

            if merge_languages and attributed:
                # Union with the existing codes, keeping their order; skip the
                # write entirely when the CSV adds nothing new. language_codes
                # is nullable, hence the coalesce.
                on_conflict = """on conflict (rcic_number) do update set
    language_codes = coalesce(consultants.language_codes, '{}') || array(
        select x from unnest(excluded.language_codes) as x
        where not x = any(coalesce(consultants.language_codes, '{}'))
    ),
    updated_at = now()
where not (excluded.language_codes <@ coalesce(consultants.language_codes, '{}'))"""
            else:
                on_conflict = "on conflict (rcic_number) do nothing"

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
{on_conflict};
""".strip())

            # Join row
            if r.get('_business_id'):
                # is_primary only true if this is the FIRST business we link
                # this consultant to in the batch AND it's the first RCIC of a
                # multi-RCIC firm row.
                is_primary_link = attributed and (rcic not in seen_rcic_primary)
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
        print(f"ABORT: {len(unknown_languages)} row(s) have languages that match no "
              f"languages-table label, alias, or code. No SQL emitted.", file=sys.stderr)
        for biz, cname, rcic_cell, raw, bad in unknown_languages:
            print(f"  - {cname or '(no name)'} [{rcic_cell}] at {biz}: "
                  f"{', '.join(repr(b) for b in bad)}  (raw: {raw!r})", file=sys.stderr)
        if not dry_run:
            sys.exit(1)

    if dry_run:
        # Still show the report (unknown languages excluded) so the failures
        # can be judged in context; exit non-zero if validation failed.
        report_dry_run(sb_url, sb_key, mode, merge_languages, parsed_consultants,
                       len(business_inserts), seen_place_ids, skipped, flagged_websites)
        sys.exit(1 if unknown_languages else 0)

    # ---------------- Emit ----------------
    print("-- Generated by seed_from_csv.py")
    print(f"-- Source: {csv_path}")
    print(f"-- Mode: {mode}")
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
    print(f"Mode: {mode}", file=sys.stderr)
    print(f"Generated {consultant_count} consultant inserts across {len(business_inserts)} businesses.", file=sys.stderr)

    if flagged_websites:
        print(f"\n{len(flagged_websites)} suspicious websites (review before publishing):", file=sys.stderr)
        for name, reason, url in flagged_websites:
            print(f"  - {name}: [{reason}] {url}", file=sys.stderr)

    if skipped:
        print(f"\n{len(skipped)} skipped rows / placeholders:", file=sys.stderr)
        for name, reason in skipped:
            print(f"  - {name}: {reason}", file=sys.stderr)


def report_dry_run(url, key, mode, merge_languages, parsed, business_count,
                   place_ids, skipped, flagged):
    """Print what the import would change versus the live DB. Reads only."""
    existing = {
        c['rcic_number']: c
        for c in supabase_get(url, key, 'consultants', {
            'select': 'rcic_number,full_name,language_codes,status'})
    }
    known_places = {
        b['google_place_id']
        for b in supabase_get(url, key, 'businesses', {'select': 'google_place_id'})
        if b.get('google_place_id')
    }

    # New consultants: the first row wins (later rows hit ON CONFLICT).
    # Existing consultants: accumulate the CSV languages the merge would add,
    # in statement order, from rows attributed to that RCIC only.
    new, gains, existing_seen = {}, {}, set()
    for rcic, name, city, langs, attributed in parsed:
        cur = existing.get(rcic)
        if cur is None:
            new.setdefault(rcic, (name, city, langs))
            continue
        existing_seen.add(rcic)
        if merge_languages and attributed:
            have = list(cur.get('language_codes') or []) + gains.get(rcic, [])
            added = [l for l in langs if l not in have]
            if added:
                gains.setdefault(rcic, []).extend(added)

    new_places = [p for p in place_ids if p not in known_places]

    print("=== DRY RUN — no SQL emitted, nothing written ===")
    print(f"Mode: {mode}")
    print(f"Consultants in CSV: {len(new) + len(existing_seen)} unique RCICs "
          f"({len(new)} new, {len(existing_seen)} already in the database)")
    print(f"Existing consultants that would be updated: {len(gains)} "
          f"(languages added only; removals, full_name and primary_city_slug "
          f"changes are never generated)")
    print(f"Businesses in CSV: {business_count} "
          f"({len(new_places)} new; existing businesses are never updated)")

    if gains:
        print(f"\nWould gain languages ({len(gains)}):")
        for rcic in sorted(gains):
            cur = existing[rcic]
            print(f"  - {rcic} {cur.get('full_name')} [{cur.get('status')}]: "
                  f"+{gains[rcic]}  (now {cur.get('language_codes') or []})")
    if new:
        print(f"\nNew ({len(new)}):")
        for rcic, (name, city, langs) in sorted(new.items()):
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
    flags = {'--dry-run', '--merge-languages'}
    args = sys.argv[1:]
    unknown_flags = [a for a in args if a.startswith('--') and a not in flags]
    paths = [a for a in args if not a.startswith('--')]
    if unknown_flags or len(paths) != 1:
        print("Usage: python3 seed_from_csv.py [--dry-run] [--merge-languages] <batch.csv>",
              file=sys.stderr)
        sys.exit(1)
    main(paths[0], dry_run='--dry-run' in args, merge_languages='--merge-languages' in args)
