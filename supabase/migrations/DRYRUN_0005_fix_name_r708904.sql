-- DRY RUN for 0005_fix_name_r708904.sql. Not a migration: the name doesn't
-- match <digits>_<name>.sql, so the Supabase CLI skips it.
-- Paste into the SQL editor. The editor shows only the last result set, so
-- the "after" SELECT is the last statement before ROLLBACK.
-- Keep in sync with 0005.
begin;

-- Before
select rcic_number, slug, full_name, given_name, family_name, updated_at
from consultants
where rcic_number = 'R708904';

update consultants
set full_name = 'Ahmad Alnaji',
    given_name = 'Ahmad',
    family_name = 'Alnaji',
    updated_at = now()
where rcic_number = 'R708904'
  and full_name = 'Alnaji';

-- After (expect: Ahmad Alnaji / Ahmad / Alnaji, slug unchanged)
select rcic_number, slug, full_name, given_name, family_name, updated_at
from consultants
where rcic_number = 'R708904';

rollback;
