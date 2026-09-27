-- Fix the name of R708904, verified against the CICC register as
-- "Ahmad Alnaji" (imported as the single word "Alnaji").
-- Idempotent: only applies while full_name is still 'Alnaji', so it can't
-- overwrite a later correction. Slug is not changed.
update consultants
set full_name = 'Ahmad Alnaji',
    given_name = 'Ahmad',
    family_name = 'Alnaji',
    updated_at = now()
where rcic_number = 'R708904'
  and full_name = 'Alnaji';
