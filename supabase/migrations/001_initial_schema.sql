-- Cache Me Outside initial schema

create extension if not exists "pgcrypto";

create table capsule_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  source_name text,
  source_url text,
  image_url text,
  image_alt text,
  image_source_url text,
  image_license text,
  category text not null,
  tags text[] not null default '{}',
  period_start date not null,
  period_end date,
  period_granularity text not null,
  origin text not null default 'manual',
  confidence text not null default 'medium',
  status text not null default 'draft',
  featured boolean not null default false,
  editorial_note text,
  opinion text,
  quote text,
  seo_title text,
  seo_description text,
  slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, period_start)
);

create table capsule_drafts (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  level text not null,
  generator_name text not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  review_status text not null default 'pending',
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table period_seo (
  id uuid primary key default gen_random_uuid(),
  period_key text not null unique,
  level text not null,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_url text,
  updated_at timestamptz not null default now()
);

create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table admin_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table admin_sessions (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null unique,
  fingerprint text not null,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  last_reauthenticated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table trend_signals (
  id uuid primary key default gen_random_uuid(),
  period_key text not null,
  source text not null,
  query text not null,
  score numeric not null default 0,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index capsule_entries_period_status_idx on capsule_entries (period_start, status);
create index capsule_entries_slug_idx on capsule_entries (slug);
create index capsule_drafts_period_review_idx on capsule_drafts (period_key, review_status);
create index admin_access_tokens_expires_idx on admin_access_tokens (expires_at, used_at);
create index admin_sessions_expires_idx on admin_sessions (expires_at);
create index trend_signals_period_score_idx on trend_signals (period_key, score desc);
