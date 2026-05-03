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
