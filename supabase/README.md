# Database process

## The Supabase CLI is not used against production

This project is **not linked** to the Supabase CLI (no `config.toml`, no
`.temp/`). Never run these against production:

- `supabase link`
- `supabase db push`
- `supabase db reset`

Production's migration history is unknown, so `db push` could try to re-run
every file from `0001_init.sql` onward.

## How migrations are applied

Gus applies migrations by hand in the Supabase SQL editor.

**Rule: no SQL runs against production unless it is committed to this repo
first.**

## DRYRUN_ files

Every data-changing migration ships with a matching `DRYRUN_` file in
`migrations/`. It is structured as:

```sql
begin;
-- the migration's changes
-- verification SELECTs
rollback;
```

Run the `DRYRUN_` file first and check its output, then run the migration.
The `DRYRUN_` prefix doesn't match the CLI's `<digits>_<name>.sql` pattern,
so the CLI never treats these as migrations. Keep each one in sync with its
migration.

## Migration notes

- **`0001a_pre_import.sql`**: already applied to production (on or around
  2026-05-09) and recorded here only. Do not re-run it. The CLI skips it
  (`0001a` isn't all digits), so a database built by the CLI will not match
  production: it lacks the 5–7 digit RCIC check and the
  `consultants_validate_arrays` trigger.
- **Known gap:** the consultant inserts of 2026-06-02 to 2026-06-22 (71 rows,
  no `import_batch_id`) and the bulk update of 162 consultants on 2026-06-22
  were run by hand and are not in this repo.

## Backups

- JSON exports of the live tables: `~/Backups/immigratealberta/<UTC timestamp>/`
- `pg_dump` files: `~/Backups/immigratealberta/<UTC timestamp>/` (none yet;
  needs a direct Postgres connection string and `pg_dump`)
