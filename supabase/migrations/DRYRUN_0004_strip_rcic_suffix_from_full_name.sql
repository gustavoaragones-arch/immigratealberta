-- DRY RUN for 0004_strip_rcic_suffix_from_full_name.sql. Not a migration: the
-- name doesn't match <digits>_<name>.sql, so the Supabase CLI skips it.
-- Paste into the SQL editor: previews, applies inside a transaction, shows
-- the result, then rolls everything back. Keep in sync with 0004.
begin;

-- Preview: rows that would change
select rcic_number,
       full_name as current_full_name,
       regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', '') as cleaned_full_name
from consultants
where full_name ~ '\s*/\s*R[0-9]+\s*$'
order by rcic_number;

update consultants
set full_name = regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', ''),
    updated_at = now()
where full_name ~ '\s*/\s*R[0-9]+\s*$'
  and btrim(regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', '')) <> '';

-- Confirm: should return 0 rows
select rcic_number, full_name
from consultants
where full_name ~ '/\s*R[0-9]+'
order by rcic_number;

rollback;
