# ImmigrateAlberta

## Database setup

### Option A — Supabase CLI (local or linked project)

From the repository root, with the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

**Local development** (Docker running, project initialized with `supabase init` if needed):

```bash
supabase start
supabase db reset
```

`db reset` applies all files under `supabase/migrations/` (including `0001_init.sql`). After that, load seed data:

```bash
supabase db execute --file supabase/seed.sql
```

**Hosted project** linked to this repo (`supabase link --project-ref <your-project-ref>`):

```bash
supabase db push
supabase db execute --file supabase/seed.sql
```

If `db execute` is not available in your CLI version, use the Supabase Dashboard → **SQL Editor** for `supabase/seed.sql` as in Option B.

### Option B — Supabase Studio (SQL Editor)

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Paste the full contents of `supabase/migrations/0001_init.sql`, run it once.
3. Open a new query, paste the full contents of `supabase/seed.sql`, run it once.

Do not run the seed before the migration has completed successfully.
