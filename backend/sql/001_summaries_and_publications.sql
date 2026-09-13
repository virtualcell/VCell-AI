-- Precomputed biomodel summaries + the publication data they are generated from.
--
-- There is no migration tooling in this repo; Supabase tables are created by hand
-- in the dashboard SQL editor. This file is the record of what was run, so the
-- schema can be recreated on another project. Safe to re-run.

-- Mirror of the VCell v1 publications feed (GET /api/v1/publications), cleaned at
-- ingest: DOIs trimmed, the junk `url` field dropped, author arrays rejoined, and
-- the "0"/absent pubmedid values normalised to NULL.
create table if not exists publications (
  pub_key     bigint primary key,
  title       text not null,
  authors     text,
  year        int,
  citation    text,
  pubmedid    text,
  doi         text,
  abstract    text,          -- from PubMed E-utilities; null when unavailable
  pub_date    date,
  raw         jsonb not null,
  synced_at   timestamptz not null default now()
);

-- Many-to-many: ~288 references over ~258 distinct biomodels, with 28 models
-- cited by more than one publication.
create table if not exists biomodel_publications (
  bm_key       bigint not null,
  pub_key      bigint not null references publications(pub_key) on delete cascade,
  model_name   text,
  owner_name   text,
  owner_key    bigint,
  version_flag int,
  primary key (bm_key, pub_key)
);

create index if not exists biomodel_publications_bm_key_idx
  on biomodel_publications (bm_key);

-- One generated summary per biomodel version (bm_key pins a specific saved
-- version). input_hash and skill_hash let a re-run skip unchanged models, and
-- make an edit to SKILL.md invalidate every summary it produced.
create table if not exists biomodel_summaries (
  bm_key       bigint primary key,
  model_name   text,
  owner_name   text,
  summary_md   text,                       -- null only when status = 'failed'
  status       text not null default 'ok', -- 'ok' | 'failed'
  error        text,
  input_hash   text not null,
  skill_hash   text not null,
  llm_model    text not null,
  used_bngl    boolean not null default false,
  pub_keys     bigint[] not null default '{}',
  generated_at timestamptz not null default now()
);

create index if not exists biomodel_summaries_status_idx
  on biomodel_summaries (status);

-- The backend reaches Supabase with the service-role key, which bypasses RLS.
-- Enabling RLS with no policies keeps the anon key from reading these directly.
alter table publications enable row level security;
alter table biomodel_publications enable row level security;
alter table biomodel_summaries enable row level security;
