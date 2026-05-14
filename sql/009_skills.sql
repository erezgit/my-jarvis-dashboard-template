-- 009_skills.sql
-- Skills as the org-chart primitive (MJOS-043).
-- Each row = one role definition (CEO, Head of R&D, Head of Marketing, ...).
-- Team agents load the skill that fits the dispatched task. Personas are
-- identity (voice, label); skills are role doctrine. Same persona can load
-- different skills on different dispatches.

create table if not exists skills (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  body         text not null default '',
  status       text not null default 'active'
               check (status in ('draft','active','archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists skills_slug_idx on skills(slug);

-- Reuse the existing set_updated_at trigger function from 008.
create trigger skills_updated
  before update on skills
  for each row execute function set_updated_at();
