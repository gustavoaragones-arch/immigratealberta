-- DRY RUN for 0003_add_languages_restore_dropped.sql. Not a migration: the
-- name doesn't match <digits>_<name>.sql, so the Supabase CLI skips it.
-- Paste into the SQL editor: runs the migration inside a transaction, shows
-- the result, then rolls everything back. Keep in sync with 0003.
begin;

-- Add 11 languages that appear in consultant source data but had no row in
-- `languages`, so the CSV import used to drop them silently.
-- Not added to FILTERABLE_LANGUAGES: no city × language pages for these.
insert into languages (code, name_en, name_native) values
  ('ti', 'Tigrinya', 'ትግርኛ'),
  ('nl', 'Dutch', 'Nederlands'),
  ('ml', 'Malayalam', 'മലയാളം'),
  ('ta', 'Tamil', 'தமிழ்'),
  ('de', 'German', 'Deutsch'),
  ('ms', 'Malay', 'Bahasa Melayu'),
  ('nd', 'North Ndebele', 'isiNdebele'),
  ('th', 'Thai', 'ไทย'),
  ('sn', 'Shona', 'chiShona'),
  ('he', 'Hebrew', 'עברית'),
  ('ja', 'Japanese', '日本語')
on conflict (code) do nothing;

-- Restore languages the old import dropped or mislabelled for the 7
-- consultants whose source rows listed them: the 11 new codes above, plus
-- sk/cs (dropped as unknown), yue (mapped to zh) and gu (dropped as unknown).
-- Union with current language_codes (existing order kept, nothing removed);
-- matched on rcic_number, the consultants' unique key.
update consultants
set language_codes = coalesce(language_codes, '{}') || array(
      select x from unnest(v.add_codes) as x
      where not x = any(coalesce(language_codes, '{}'))
    ),
    updated_at = now()
from (values
  ('R527904', array['ti']),                                    -- Syntyche Amanuel
  ('R420799', array['nl']),                                    -- Martine Varekamp-Bos
  ('R707287', array['ml', 'ta']),                              -- Geraldine Herrera Valiarayil
  ('R411895', array['de']),                                    -- Carla Hess
  ('R506879', array['ms', 'ta', 'ml', 'nd', 'th', 'sn', 'he', 'yue']), -- Marty Baram
  ('R530087', array['ja', 'sk', 'cs']),                        -- Agueda Gyurikova Morsy
  ('R525946', array['gu'])                                     -- Sorell Sonara
) as v(rcic_number, add_codes)
where consultants.rcic_number = v.rcic_number
  and not (v.add_codes <@ coalesce(consultants.language_codes, '{}'));

select rcic_number, full_name, language_codes
from consultants
where rcic_number in ('R527904', 'R420799', 'R707287', 'R411895', 'R506879', 'R530087', 'R525946')
order by rcic_number;

select code, name_en
from languages
where code in ('ti', 'nl', 'ml', 'ta', 'de', 'ms', 'nd', 'th', 'sn', 'he', 'ja')
order by code;

rollback;
