-- Strip a trailing "/R<digits>" suffix (optional whitespace around it) from
-- consultants.full_name, e.g. "Jigna Jain/R731296" -> "Jigna Jain".
-- Idempotent: only rows that still end with the suffix are touched, and a
-- name is never left empty.
update consultants
set full_name = regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', ''),
    updated_at = now()
where full_name ~ '\s*/\s*R[0-9]+\s*$'
  and btrim(regexp_replace(full_name, '\s*/\s*R[0-9]+\s*$', '')) <> '';
