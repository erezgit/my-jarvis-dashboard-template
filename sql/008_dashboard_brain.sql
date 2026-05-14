-- 008_dashboard_brain.sql
-- Dashboard-as-brain: 5 core tables for projects, goals, tickets, agents, memories.
-- Tickets follow PAI's ISA-12 format (12 sections + ISCs as jsonb).
-- Memories type-discriminated: session_log | learning | user_fact | area.

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  mission     text,
  status      text not null default 'active'
              check (status in ('active','paused','done','archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists goals (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  project_id   uuid not null references projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'active'
               check (status in ('active','paused','done','archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists goals_project_idx on goals(project_id);

create table if not exists tickets (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  project_id      uuid references projects(id) on delete set null,
  goal_id         uuid references goals(id)    on delete set null,
  parent_id       uuid references tickets(id)  on delete set null,
  agent           text,
  title           text not null,
  status          text not null default 'todo'
                  check (status in ('todo','in_progress','review','done','archived')),
  current_step    text,
  -- ISA-12 body sections (markdown)
  problem         text,
  vision          text,
  out_of_scope    text,
  principles      text,
  constraints     text,
  goal            text,
  test_strategy   text,
  features        text,
  decisions       text,
  changelog       text,
  verification    text,
  -- ISCs as queryable structured data: [{id,text,status,probe}]
  iscs            jsonb not null default '[]'::jsonb,
  -- running notes
  log             text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists tickets_project_idx     on tickets(project_id);
create index if not exists tickets_goal_idx        on tickets(goal_id);
create index if not exists tickets_agent_status_ix on tickets(agent, status);

create table if not exists agents (
  name              text primary key,
  display_name      text not null,
  voice_kokoro      text not null,
  voice_mcp         text,
  color             text,
  identity_md       text,
  principles_md     text,
  current_ticket_id uuid references tickets(id) on delete set null,
  updated_at        timestamptz not null default now()
);

-- NOTE: agent seed rows live in 099_seed.sql (template ships Jarvis only).

create table if not exists memories (
  id          uuid primary key default gen_random_uuid(),
  agent       text references agents(name) on delete set null,
  type        text not null check (type in ('session_log','learning','user_fact','area','principle','identity')),
  title       text,
  body        text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists memories_agent_type_ix    on memories(agent, type);
create index if not exists memories_type_created_ix  on memories(type, created_at desc);

-- updated_at trigger function
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end
$$ language plpgsql;

drop trigger if exists projects_updated on projects;
drop trigger if exists goals_updated    on goals;
drop trigger if exists tickets_updated  on tickets;
drop trigger if exists agents_updated   on agents;

create trigger projects_updated before update on projects for each row execute function set_updated_at();
create trigger goals_updated    before update on goals    for each row execute function set_updated_at();
create trigger tickets_updated  before update on tickets  for each row execute function set_updated_at();
create trigger agents_updated   before update on agents   for each row execute function set_updated_at();
