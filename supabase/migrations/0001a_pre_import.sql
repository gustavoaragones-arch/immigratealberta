-- Already applied to production on or around 2026-05-09.
-- Recorded for reproducibility. Do not re-run against production.
--
-- Source: migration_001_pre_import.sql (run by hand in the Supabase SQL editor
-- before the batch1 import). Named 0001a_ so it sorts between 0001 and 0002,
-- its real order of application, while not matching the CLI's
-- <digits>_<name>.sql pattern, so the Supabase CLI skips it.

-- ============================================================
-- Migration 001: pre-import safety
-- Run this in Supabase SQL editor BEFORE importing seed data
-- ============================================================

-- 1) Widen RCIC regex to support 5-7 digit IDs
--    Legacy IDs: 5-6 digits (e.g. R14145, R526520)
--    Post-2023 IDs: 7 digits (e.g. R1034382, R1040832, R1053857)
alter table consultants drop constraint if exists consultants_rcic_number_check;
alter table consultants add constraint consultants_rcic_number_check
    check (rcic_number ~ '^R[0-9]{5,7}$');

-- 2) Validate that service_slugs and language_codes only contain values
--    that exist in the controlled-vocab tables. Catches typos before
--    they silently break filter queries.
create or replace function check_consultant_arrays()
returns trigger
language plpgsql
as $$
declare
    bad_services text[];
    bad_languages text[];
begin
    -- Services
    if new.service_slugs is not null and array_length(new.service_slugs, 1) > 0 then
        select array_agg(s) into bad_services
        from unnest(new.service_slugs) s
        where s not in (select slug from services);

        if bad_services is not null then
            raise exception 'Invalid service_slugs: %. Allowed values: see services table.', bad_services;
        end if;
    end if;

    -- Languages
    if new.language_codes is not null and array_length(new.language_codes, 1) > 0 then
        select array_agg(l) into bad_languages
        from unnest(new.language_codes) l
        where l not in (select code from languages);

        if bad_languages is not null then
            raise exception 'Invalid language_codes: %. Allowed values: see languages table.', bad_languages;
        end if;
    end if;

    return new;
end;
$$;

drop trigger if exists consultants_validate_arrays on consultants;
create trigger consultants_validate_arrays
    before insert or update on consultants
    for each row execute function check_consultant_arrays();

-- 3) Smoke test (uncomment to verify the trigger works after running migration):
--   insert into consultants (rcic_number, slug, full_name, licence_type, cicc_verified_on, language_codes)
--     values ('R999999','test-bad','Test Bad','RCIC',current_date, array['xx']);
--   -- expect: ERROR: Invalid language_codes: {xx}
