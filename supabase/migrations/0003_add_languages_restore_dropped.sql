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

-- Restore those languages for the 6 consultants whose source rows listed
-- them. Union with current language_codes (existing order kept, nothing
-- removed); matched on rcic_number, the consultants' unique key.
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
  ('R506879', array['ms', 'ta', 'ml', 'nd', 'th', 'sn', 'he']), -- Marty Baram
  ('R530087', array['ja'])                                     -- Agueda Gyurikova Morsy
) as v(rcic_number, add_codes)
where consultants.rcic_number = v.rcic_number
  and not (v.add_codes <@ coalesce(consultants.language_codes, '{}'));
