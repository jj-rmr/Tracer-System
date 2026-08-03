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
  if not exists (
    select 1
    from public.auth_accounts
    where id = actor_account_id
      and role = 'admin'
      and enabled = true
  ) then
    raise exception 'ADMIN_ACTOR_REQUIRED';
  end if;

  if actor_account_id = target_account_id and next_role <> 'admin' then
    raise exception 'ADMIN_SELF_DEMOTION_NOT_ALLOWED';
  end if;

  if next_role is null or next_role not in ('admin', 'coordinator', 'alumni') then
    raise exception 'INVALID_ACCOUNT_ROLE';
  end if;

  if jsonb_typeof(next_grants) is distinct from 'array' then
    raise exception 'INVALID_COORDINATOR_GRANTS';
  end if;

  if next_role = 'coordinator' and jsonb_array_length(next_grants) = 0 then
    raise exception 'COORDINATOR_GRANTS_REQUIRED';
  end if;

  if jsonb_array_length(next_grants) > 100 then
    raise exception 'TOO_MANY_COORDINATOR_GRANTS';
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
