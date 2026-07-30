-- Provider-neutral application accounts. The primary key is deliberately text:
-- imported legacy IDs remain stable while new accounts use Supabase UUIDs.
create table public.auth_accounts (
  id text primary key,
  provider text not null default 'supabase',
  provider_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  name text not null,
  picture_url text,
  role text not null default 'alumni'
    check (role in ('admin', 'alumni')),
  email_verified boolean not null default false,
  enabled boolean not null default true,
  role_change_notice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index auth_accounts_email_unique
  on public.auth_accounts (lower(email));
create index auth_accounts_provider_user_id_idx
  on public.auth_accounts (provider_user_id);

create trigger auth_accounts_set_updated_at
before update on public.auth_accounts
for each row execute function update_updated_at_column();

alter table public.auth_accounts enable row level security;

-- Account administration is server-only through the service-role client.
revoke all on table public.auth_accounts from anon, authenticated;
grant all on table public.auth_accounts to service_role;

comment on table public.auth_accounts is
  'Canonical application identities mapped to replaceable authentication providers.';
comment on column public.auth_accounts.id is
  'Stable application ID referenced by response ownership fields.';
