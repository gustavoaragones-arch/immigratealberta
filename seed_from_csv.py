#!/usr/bin/env python3
"""
seed_from_csv.py — convert a verified-batch CSV into a Supabase-ready SQL file.

Usage:
    python3 seed_from_csv.py batch_1.csv > 001_batch_1_seed.sql
    # then paste the .sql output into the Supabase SQL editor

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
import re
import sys
import uuid
from pathlib import Path

# ---------------- Controlled vocab (must match seed in Supabase) ----------------
LANGUAGE_MAP = {
    'english': 'en', 'french': 'fr', 'français': 'fr',
    'spanish': 'es', 'español': 'es',
    'punjabi': 'pa', 'hindi': 'hi', 'urdu': 'ur',
    'chinese': 'zh', 'mandarin': 'zh', 'cantonese': 'zh',
    'arabic': 'ar', 'tagalog': 'tl', 'filipino': 'tl', 'visayan': 'tl',
    'turkish': 'tr', 'portuguese': 'pt',
    'vietnamese': 'vi', 'korean': 'ko', 'russian': 'ru',
    'ukrainian': 'uk', 'persian': 'fa', 'farsi': 'fa',
    'amharic': 'am', 'somali': 'so',
    # languages we DON'T have codes for — will be skipped with a warning:
    # tigrinya, gujarati, tamil, malayalam, malay, thai, hebrew, ndebele, shona, dutch, german
}
KNOWN_LANGUAGE_CODES = {  # for validation; mirrors what your `languages` table holds
    'en','fr','es','pa','hi','ur','zh','ar','tl','tr','pt','vi','ko','ru','uk','fa','am','so'
}

CITY_MAP = {
    'calgary': 'calgary',
    'edmonton': 'edmonton',
    'red deer': 'red-deer',
}

RCIC_RE = re.compile(r'^R\d{5,7}$')
RCIC_SPLIT_RE = re.compile(r'[,\s]+')


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


def parse_languages(raw):
    """
    'English, Spanish, Tagalog' → ['en','es','tl']
    Unknown languages are dropped with a stderr warning.
    """
    if not raw:
        return [], []
    parts = re.split(r'[,/&]|\band\b', str(raw).lower())
    codes, unknown = [], []
    for p in parts:
        p = p.strip(' .')
        if not p:
            continue
        if p in LANGUAGE_MAP:
            code = LANGUAGE_MAP[p]
            if code in KNOWN_LANGUAGE_CODES and code not in codes:
                codes.append(code)
        else:
            unknown.append(p)
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
def main(csv_path: str):
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
    unknown_languages = set()

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

        lang_codes, unknown = parse_languages(r.get('language'))
        unknown_languages.update(unknown)

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

    if unknown_languages:
        print(f"\n{len(unknown_languages)} unknown languages (drop or add to LANGUAGE_MAP):", file=sys.stderr)
        for lang in sorted(unknown_languages):
            print(f"  - {lang!r}", file=sys.stderr)

    if skipped:
        print(f"\n{len(skipped)} skipped rows / placeholders:", file=sys.stderr)
        for name, reason in skipped:
            print(f"  - {name}: {reason}", file=sys.stderr)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 seed_from_csv.py <batch.csv>", file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])
