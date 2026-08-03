alter table public.auth_accounts
  drop constraint auth_accounts_role_check;

alter table public.auth_accounts
  add constraint auth_accounts_role_check
  check (role in ('admin', 'coordinator', 'alumni'));

create table public.coordinator_scope_grants (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references public.auth_accounts(id) on delete cascade,
  scope_type text not null check (scope_type in ('campus', 'college', 'program')),
  campus text not null check (btrim(campus) <> ''),
  college text,
  program text,
  created_by text references public.auth_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint coordinator_scope_grants_shape_check check (
    (scope_type = 'campus' and college is null and program is null)
    or (scope_type = 'college' and college is not null and btrim(college) <> '' and program is null)
    or (scope_type = 'program' and college is not null and btrim(college) <> '' and program is not null and btrim(program) <> '')
  )
);

create unique index coordinator_scope_grants_unique_assignment
  on public.coordinator_scope_grants (
    account_id,
    scope_type,
    campus,
    coalesce(college, ''),
    coalesce(program, '')
  );

create index coordinator_scope_grants_account_id_idx
  on public.coordinator_scope_grants (account_id);

alter table public.coordinator_scope_grants enable row level security;
revoke all on table public.coordinator_scope_grants from anon, authenticated;
grant select, insert, update, delete on table public.coordinator_scope_grants to service_role;

create or replace function public.replace_account_access(
  target_account_id text,
  next_role text,
  next_grants jsonb,
  actor_account_id text,
  next_notice text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if next_role not in ('admin', 'coordinator', 'alumni') then
    raise exception 'INVALID_ACCOUNT_ROLE';
  end if;

  if jsonb_typeof(next_grants) <> 'array' then
    raise exception 'INVALID_COORDINATOR_GRANTS';
  end if;

  if next_role = 'coordinator' and jsonb_array_length(next_grants) = 0 then
    raise exception 'COORDINATOR_GRANTS_REQUIRED';
  end if;

  if next_role <> 'coordinator' and jsonb_array_length(next_grants) <> 0 then
    raise exception 'COORDINATOR_GRANTS_NOT_ALLOWED';
  end if;

  delete from public.coordinator_scope_grants
  where account_id = target_account_id;

  update public.auth_accounts
  set role = next_role, role_change_notice = next_notice
  where id = target_account_id;

  if not found then
    raise exception 'ACCOUNT_NOT_FOUND';
  end if;

  if next_role = 'coordinator' then
    insert into public.coordinator_scope_grants (
      account_id, scope_type, campus, college, program, created_by
    )
    select
      target_account_id,
      grant_item->>'scopeType',
      grant_item->>'campus',
      nullif(grant_item->>'college', ''),
      nullif(grant_item->>'program', ''),
      actor_account_id
    from jsonb_array_elements(next_grants) as grant_item;
  end if;
end;
$$;

revoke all on function public.replace_account_access(text, text, jsonb, text, text)
  from public, anon, authenticated;
grant execute on function public.replace_account_access(text, text, jsonb, text, text)
  to service_role;
