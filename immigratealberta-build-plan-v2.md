# ImmigrateAlberta.ca — Cursor Build Plan (v2)

**Stack:** Next.js 14 (App Router) on Vercel · Supabase (Postgres + RLS) · Tailwind · Resend (lead emails)

**Locked decisions:**
- **Consultant (R-number) is the canonical listing unit.** Firm pages are aggregates that exist for SEO completeness.
- **Reviews are out of scope for v1.** No Google rating, no review count on cards. Trust is conveyed entirely by RCIC verification + physical office + free consultation.
- **Data is provided clean by you.** No scraping, no CICC API integration, no verification cron. You hand me a CSV; the app trusts it. The audit trail still exists in the schema for when you re-import.
- **Background standard:** `#faf9f7`. Forest-green accent for trust signals, warm orange for CTAs.

---

## Phase 1 — Repo + Schema

### Cursor Composer prompt #1: Bootstrap

> Create a Next.js 14 App Router TypeScript project with Tailwind. Configure for Vercel. Set up Supabase clients in `lib/supabase/client.ts` (anon, browser) and `lib/supabase/server.ts` (service role, server-only). Tailwind tokens: `--bg: #faf9f7`, `--ink: #1a1a1a`, `--accent: #0a5c3e`, `--accent-warm: #c8763a`, `--border: #e8e5df`. Body defaults to `bg-[--bg]`. Fonts: Source Serif 4 for headlines, Inter for body.
>
> Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.

### Cursor Composer prompt #2: Schema migration

> Generate `supabase/migrations/0001_init.sql`:

```sql
-- Controlled vocab
create table cities (
  slug text primary key,                   -- 'calgary','edmonton','red-deer'
  name text not null,
  province text not null default 'AB',
  lat numeric, lng numeric,
  is_active boolean default true,
  seo_title text, seo_description text,
  intro_md text                            -- editorial intro for the city hub
);

create table services (
  slug text primary key,                   -- 'pr','study-permit','work-permit','lmia','express-entry','family-sponsorship','refugee','citizenship'
  name text not null,
  short_label text,                        -- card pill label
  seo_title text, seo_description text,
  intro_md text
);

create table languages (
  code text primary key,                   -- 'en','fr','pa','zh','es','ar','tl','ur','hi','tr'
  name_en text not null,
  name_native text
);

-- Businesses = where consultants work. Lightweight, no reviews in v1.
create table businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- 'acme-immigration-calgary'
  legal_name text not null,
  display_name text,                       -- if differs from legal
  city_slug text references cities(slug) not null,
  address text,
  lat numeric, lng numeric,
  phone text,
  website text,
  email text,
  has_physical_office boolean default false,
  google_place_id text unique,             -- present even though we don't show reviews; future-proof
  notes_internal text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on businesses (city_slug);

-- Consultants = the canonical listing. One row per R-number.
create table consultants (
  id uuid primary key default gen_random_uuid(),
  rcic_number text unique not null check (rcic_number ~ '^R[0-9]{6}$'),
  slug text unique not null,               -- 'jane-doe-r123456' (name + r-number for disambiguation)
  full_name text not null,
  given_name text,
  family_name text,
  licence_type text not null,              -- 'RCIC','RCIC-IRB','RISIA'
  cicc_status text not null default 'Active' check (cicc_status in ('Active','Inactive','Suspended','Revoked')),
  cicc_verified_on date not null,          -- the date YOU verified them on the CICC register
  primary_city_slug text references cities(slug),  -- where they primarily practice; drives city hub assignment
  bio_md text,                             -- editorial bio (optional)
  photo_url text,                          -- optional
  free_consultation boolean,               -- nullable = unknown
  service_slugs text[] default '{}',       -- service.slug values
  language_codes text[] default '{}',      -- language.code values
  trust_score numeric default 0,           -- computed (Phase 3)
  status text default 'draft' check (status in ('draft','published','flagged','removed')),
  featured_until timestamptz,              -- monetization hook
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on consultants (primary_city_slug, status);
create index on consultants (status, trust_score desc);
create index on consultants using gin (service_slugs);
create index on consultants using gin (language_codes);

-- Many-to-many: a consultant can be associated with multiple businesses
create table consultant_businesses (
  consultant_id uuid references consultants(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  is_primary boolean default false,        -- one row per consultant should be primary
  role_label text,                         -- 'Founder', 'Senior Consultant', etc.
  created_at timestamptz default now(),
  primary key (consultant_id, business_id)
);
create unique index one_primary_business_per_consultant
  on consultant_businesses (consultant_id) where is_primary = true;

-- Leads (revenue table)
create table leads (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid references consultants(id),
  business_id uuid references businesses(id),
  service_slug text references services(slug),
  city_slug text references cities(slug),
  user_email text not null,
  user_phone text,
  user_name text,
  message text,
  language_pref text,
  source text,                             -- 'consultant_page','decision_tool','city_page','service_page','firm_page'
  utm jsonb,
  ip_hash text,
  status text default 'new' check (status in ('new','delivered','contacted','closed_won','closed_lost','spam')),
  delivered_at timestamptz,
  created_at timestamptz default now()
);
create index on leads (consultant_id, created_at desc);

-- Decision tool sessions
create table decision_sessions (
  id uuid primary key default gen_random_uuid(),
  answers jsonb not null,
  recommended_consultant_ids uuid[],
  converted_lead_id uuid references leads(id),
  created_at timestamptz default now()
);

-- Import audit log (since you do verification manually,
-- this records each batch you import so you can prove "verified on date X")
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  source_label text not null,              -- e.g. 'cicc-register-2026-04-30'
  imported_count int,
  imported_by text,                        -- your handle
  notes text,
  created_at timestamptz default now()
);

-- RLS: enable on all tables
alter table cities enable row level security;
alter table services enable row level security;
alter table languages enable row level security;
alter table businesses enable row level security;
alter table consultants enable row level security;
alter table consultant_businesses enable row level security;
alter table leads enable row level security;
alter table decision_sessions enable row level security;
alter table import_batches enable row level security;

-- Public read policies (anon key)
create policy "anon read cities"      on cities      for select using (is_active);
create policy "anon read services"    on services    for select using (true);
create policy "anon read languages"   on languages   for select using (true);
create policy "anon read businesses"  on businesses  for select using (true);
create policy "anon read consultants" on consultants for select using (status = 'published');
create policy "anon read cb"          on consultant_businesses for select using (
  exists (select 1 from consultants c where c.id = consultant_id and c.status = 'published')
);

-- leads, decision_sessions, import_batches: NO public policies → service role only
```

**Why no `verified_rcic` boolean:** every consultant in this table is, by definition, verified — that's the whole point of the consultant-primary model. The `cicc_status` field carries the granular truth (`Active` / `Suspended` / etc.), and only `Active` rows get `status='published'`. Don't add a redundant flag that can drift out of sync.

---

## Phase 2 — Data Import (you provide clean CSV; we build the importer)

You'll maintain a CSV with these columns:

```
rcic_number, full_name, licence_type, cicc_status, cicc_verified_on,
primary_city, business_legal_name, business_address, business_phone,
business_website, business_email, has_physical_office, free_consultation,
services (semicolon-separated slugs), languages (semicolon-separated codes),
role_label, bio_md (optional), photo_url (optional)
```

### Cursor Composer prompt #3: Import script

> Create `scripts/import.ts` that:
> 1. Reads `data/consultants.csv`.
> 2. Creates an `import_batches` row tagged with today's date and the filename.
> 3. For each row: upserts the business by `legal_name + city`, upserts the consultant by `rcic_number`, links them via `consultant_businesses` (marks `is_primary=true` on the first business per consultant per import).
> 4. Splits `services` and `languages` on `;`, validates against the controlled vocab tables, fails loudly on unknown slugs.
> 5. Sets `consultants.status = 'published'` only when `cicc_status = 'Active'`. Otherwise `'flagged'`.
> 6. Generates the consultant slug as `slugify(full_name) + '-' + rcic_number.toLowerCase()`.
> 7. Prints a summary: imported, updated, skipped, flagged.
>
> Run with `npx tsx scripts/import.ts`. Idempotent — re-running with the same CSV produces zero changes.

**Why this design.** When you re-verify monthly and re-import, the `cicc_verified_on` column updates and the `import_batches` table gives you a defensible audit trail: "On 2026-05-15 I verified R123456 was Active." If anyone ever disputes a listing, you have the date.

---

## Phase 3 — Trust Score & Ranking

No reviews in v1, so the formula is much simpler than the original plan.

### Cursor Composer prompt #4: Trust score function

> Add a Postgres function and trigger that computes `consultants.trust_score`:
>
> ```
> base = 1.0
>
> multipliers (multiplicative):
>   × 1.30  if has_physical_office (via primary business)
>   × 1.20  if free_consultation = true
>   × 1.15  if length(language_codes) >= 2     (multilingual = wider match surface)
>   × 1.10  if length(service_slugs) <= 3      (specialists rank above generalists)
>   × 1.10  if photo_url is not null           (completeness signal)
>   × 1.10  if bio_md is not null and length(bio_md) > 200
>   × 0.00  if status != 'published'
>
> trust_score = round(base * product(multipliers), 4)
> ```
>
> Recompute on insert/update of any input field. Default ORDER BY everywhere: `featured_until > now() DESC, trust_score DESC, full_name ASC`.

**The signal philosophy.** Without reviews, you're ranking on **completeness and commitment**. A consultant who filled out their profile fully, has a real office, offers free consultations, and speaks two languages is signaling "I take this seriously." That's the proxy for quality until you have organic reviews. The `0.00` kill-switch ensures unpublished rows never accidentally appear via direct query.

When you add reviews in v2, this function gets one more multiplier. The structure holds.

---

## Phase 4 — Routing & Pages

```
/                                                  → Homepage
/decide                                            → Decision tool (4-step)
/decide/results/[session-id]                       → Personalized matches
/verify                                            → "How we verify" trust page
/about
/for-consultants                                   → B2B claim/upgrade landing

/consultants/[consultant-slug]                     → CANONICAL listing page
/firm/[business-slug]                              → Business aggregate (lists consultants there)

/calgary                                           → City hub (top consultants in Calgary)
/edmonton
/red-deer

/calgary/study-permit-consultants                  → city × service hub
/calgary/pr-consultants
/calgary/work-permit-consultants
/edmonton/study-permit-consultants
…(generated from cities × services)

/sitemap.xml
/robots.txt
```

### Cursor Composer prompt #5: Page builder

> Build all pages above. Rules:
>
> 1. **Every page exports `generateMetadata`** with title, description, canonical URL, OpenGraph tags.
> 2. **JSON-LD on every page:** `Person` schema on consultant pages (with `jobTitle: 'Regulated Canadian Immigration Consultant'`, `identifier: rcic_number`), `LocalBusiness` on firm pages, `ItemList` on hubs, `FAQPage` on city/service hubs (3-5 FAQs each, editorially written).
> 3. **AEO answer block above the fold** on every hub page: a `<div data-aeo="answer">` containing 2-3 plain sentences directly answering the implied question. Generative engines extract these.
> 4. **H1 matches the primary keyword exactly.** `/calgary/study-permit-consultants` → H1 is "Study Permit Consultants in Calgary, Alberta". No clever variations.
> 5. **Consultant card** displays, in order: photo (or initials avatar), full name, "RCIC R######" + licence type, primary city, primary business name, badges row (physical office / free consult / multilingual), services as small pills, languages as flag-style pills, primary CTA "Request consultation", secondary "View profile". No star rating, no review count.
> 6. **Consultant detail page** structure:
>    - Hero: name, R-number prominently displayed (this is a trust signal — fraudsters won't put a fake R-number on a public page that links to the CICC register), licence type, "Verified on [date]" microcopy.
>    - Trust strip: badges + a `<CICCRegisterLink>` that deep-links to the CICC public register with the R-number prefilled if their search URL supports it (otherwise links to the search page with copy-paste guidance).
>    - Bio (if present).
>    - "Where this consultant works": cards for every business in `consultant_businesses` (this is where the multi-business answer materializes).
>    - Services + languages.
>    - "Request consultation" form (sticky on mobile).
>    - "How we verified this listing" disclosure linking to `/verify`.
> 7. **Firm page** is lighter: business info + the list of consultants who work there + their CTAs. No separate contact form; CTAs route to individual consultants.

### Cursor Composer prompt #6: Sitemap and SEO infrastructure

> Build `app/sitemap.ts` that emits all consultant URLs, all firm URLs, all city hubs, all city × service hubs, and static pages. `lastModified` pulls from `consultants.updated_at` / `businesses.updated_at`. Build `app/robots.ts` allowing all crawlers, sitemap reference. Add a `<TrustScoreExplainer>` component used on every consultant card hub, expandable: "Why is this consultant ranked here?" — lists the inputs transparently. This is your AEO/GEO advantage: search engines that try to summarize your ranking will succeed because you publish the methodology.

---

## Phase 5 — Decision Tool (the wedge)

### Cursor Composer prompt #7: /decide flow

> Build `/decide` as a 4-step stepper. State in URL search params (deep-linkable):
>
> 1. **What do you need?** → service (single-select from `services` table)
> 2. **Where in Alberta?** → city (or "anywhere")
> 3. **Preferred language?** → language (multi-select from `languages` table)
> 4. **How urgent?** → 'this week' / 'this month' / '3+ months'
>
> On submit → POST `/api/decide` which:
> - Inserts `decision_sessions` row.
> - Queries `consultants` where `service_slugs && [service]` AND (`primary_city_slug = ?` OR city is "anywhere") AND `language_codes && [langs]` AND `status = 'published'`.
> - For 'this week' urgency, filter to `free_consultation = true` (people on a tight timeline avoid paid intros).
> - ORDER BY default ranking, LIMIT 3.
> - Saves recommended_consultant_ids on the session.
> - Returns `{session_id}` → redirect to `/decide/results/[session_id]`.
>
> **Critical UX rule:** results page renders the 3 matches WITHOUT requiring an email. Email is only collected when the user clicks "Request consultation" on a specific consultant. This is the mechanical-necessity principle: we collect data only when it's needed to make a match happen.
>
> If fewer than 3 matches: show what we have, plus a fallback "see all in [city]" link to the relevant city hub.

This is the page you optimize ruthlessly. Track funnel completion (step 1 → 4 → result view → CTA click) with a lightweight analytics setup (Plausible or self-hosted Umami; not GA — privacy expectations matter for an immigration audience).

---

## Phase 6 — Lead Routing

### Cursor Composer prompt #8: /api/leads

> Build `POST /api/leads` accepting `{ consultant_id, business_id?, service_slug, user_email, user_phone?, user_name, message, language_pref, source, utm }`.
>
> Steps:
> 1. Validate input with Zod. Reject if user_email is invalid or message > 2000 chars.
> 2. Hash IP (`sha256(ip + DAILY_SALT)`), check rate limit: max 3 leads / 24h per ip_hash. Over → status='spam', return 200 silently (don't tell scrapers they're rate-limited).
> 3. Insert into `leads` with status='new'.
> 4. Look up consultant's primary business email; fall back to consultant-level if you add it later.
> 5. Send via Resend:
>    - To consultant/business: lead details + "Mark as contacted" link with a signed token.
>    - To user: confirmation "[Consultant Name] has received your request. Most consultants respond within 24-48 hours."
> 6. Update `delivered_at` on success.
>
> Build `PATCH /api/leads/[id]/status?token=…` accepting `{ status }`. Verify HMAC token. This is the lightest possible CRM — consultants update lead status from their email.

---

## Visual identity recap (UI components in `components/ui/`)

- `<TrustBadge variant="rcic-verified" | "physical-office" | "free-consult" | "multilingual" />` — pill, forest-green check, accessible label, links to `/verify`.
- `<RCICNumber value="R123456" />` — formatted, monospace, with a small CICC link icon next to it.
- `<ConsultantCard>` and `<ConsultantDetailHero>`.
- `<FirmCard>` and `<FirmAggregate>` (firm page that lists the consultants there).
- `<CICCRegisterLink rcicNumber="R123456" />` — opens the CICC public register. Even if you can't deep-link to a prefilled search, the user can verify your verification.
- `<DecideStepper>` — the 4-question flow.
- `<TrustScoreExplainer>` — disclosure component on hub pages.

Design rules: **no shadows, no gradients, no glassmorphism.** Generic SaaS aesthetics actively hurt trust in this category. Aim for "considered, institutional, slightly editorial." Serif headlines do most of that work.

---

## Launch gates

Before flipping DNS:

1. **30+ published consultants in Calgary, 30+ in Edmonton.** Below that the city hubs look empty.
2. **Every published consultant has `cicc_verified_on` within the last 30 days.**
3. **`/verify` page explains your manual verification process in plain language**, including: how often you re-check, what happens when a consultant becomes Suspended/Inactive, how users can report issues.
4. **"Report a problem" link on every consultant page** routing to ops email.
5. **Privacy policy + ToS specifically address:** display of public CICC data, lead data flow, deletion requests. Generic templates fail in this category.
6. **Sitemap submitted, structured data validated** in Google Rich Results Test on a consultant page, a firm page, and a city hub.

---

## Claude Code audit checkpoints

- **After Phase 1-2:** Schema + RLS audit. Question to ask Claude Code: "Can a malicious anon enumerate `leads`, `decision_sessions`, or non-published consultants? Are the indexes correct for the city/service/language filter combinations the decision tool runs?"
- **After Phase 5:** Decision tool privacy audit. "Is any user input persisted before they explicitly opt in by submitting a lead? Are decision_sessions de-anonymizable through the answers JSONB?"
- **Before launch:** Full pass on `/api/*` — auth, rate limits, Zod validation coverage, error message leakage. JSON-LD spot-check on three live URLs.

---

## What this plan deliberately omits

- **Reviews of any kind.** Locked decision.
- **User accounts / saved searches.** No friction. Add only if retention data demands it.
- **Native chat / AI advisor.** Regulatory landmine in Canada — too close to providing advice without a licence.
- **Pricing display, success rates, years of experience.** All locked exclusions from your spec.
- **Multi-province expansion.** Domain is `immigratealberta.ca`. Own Alberta first.
- **Scraping / verification automation.** You handle it manually; the schema records when.

---

## Build sequence

```
Week 1: Phase 1-2  (repo + schema + import script)
Week 2: Phase 3-4  (trust score + all page routes built)
Week 3: Phase 5-6  (decision tool + leads)
Week 4: Polish, content for /verify, /about, FAQ blocks; soft launch
```

Four weeks to launch, assuming you have a populated CSV ready by end of Week 1. Roughly half the original timeline because we removed the entire ingestion + verification engineering layer.
