-- Strip a trailing "/R<digits>" suffix (optional whitespace around it) from
-- consultants.full_name and consultants.family_name,
-- e.g. "Jigna Jain/R731296" -> "Jigna Jain", "Jain/R731296" -> "Jain".
-- Idempotent: each column is only touched while it still ends with the
-- suffix, and never left empty. Slugs are not changed.
update consultants
set full_name = case
      when full_name ~ '\s*/\s*R[0-9]+\s*$'
       and btrim(regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', '')) <> ''
      then regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', '')
      else full_name
    end,
    family_name = case
      when family_name ~ '\s*/\s*R[0-9]+\s*$'
       and btrim(regexp_replace(family_name, '\s*/\s*R[0-9]+\s*$', '')) <> ''
      then regexp_replace(family_name, '\s*/\s*R[0-9]+\s*$', '')
      else family_name
    end,
    updated_at = now()
where (full_name ~ '\s*/\s*R[0-9]+\s*$'
       and btrim(regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', '')) <> '')
   or (family_name ~ '\s*/\s*R[0-9]+\s*$'
       and btrim(regexp_replace(family_name, '\s*/\s*R[0-9]+\s*$', '')) <> '');
