create table if not exists public.security_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text not null,
  action text not null check (char_length(action) between 1 and 100),
  target_type text not null check (char_length(target_type) between 1 and 100),
  target_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists security_audit_events_created_at_idx
  on public.security_audit_events (created_at desc);

alter table public.security_audit_events enable row level security;
revoke all on table public.security_audit_events from anon, authenticated;
grant select, insert on table public.security_audit_events to service_role;
