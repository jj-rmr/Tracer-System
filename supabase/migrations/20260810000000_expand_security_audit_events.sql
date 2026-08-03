alter table public.security_audit_events
add column if not exists actor_name text,
add column if not exists actor_email text;

update public.security_audit_events as event
set
  actor_name = account.name,
  actor_email = account.email
from public.auth_accounts as account
where account.id = event.actor_user_id
  and (event.actor_name is null or event.actor_email is null);

alter table public.security_audit_events
add column if not exists search_text text generated always as (
  lower(
    coalesce(actor_name, '') || ' ' ||
    coalesce(actor_email, '') || ' ' ||
    action || ' ' ||
    target_type || ' ' ||
    coalesce(target_id, '')
  )
) stored;

create index if not exists security_audit_events_actor_created_at_idx
  on public.security_audit_events (actor_user_id, created_at desc);

create index if not exists security_audit_events_action_created_at_idx
  on public.security_audit_events (action, created_at desc);

create index if not exists security_audit_events_target_idx
  on public.security_audit_events (target_type, target_id, created_at desc);

create or replace function public.prevent_security_audit_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Security audit events are append-only';
end;
$$;

drop trigger if exists prevent_security_audit_event_mutation
on public.security_audit_events;

create trigger prevent_security_audit_event_mutation
before update or delete on public.security_audit_events
for each row execute function public.prevent_security_audit_event_mutation();

revoke update, delete, truncate
on table public.security_audit_events
from anon, authenticated, service_role;
