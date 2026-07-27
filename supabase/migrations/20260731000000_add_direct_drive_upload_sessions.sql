create table if not exists public.direct_drive_upload_sessions (
  id uuid primary key,
  response_id uuid not null references public.form_responses(id) on delete cascade,
  actor_user_id text not null,
  document_type text not null check (document_type in ('employment', 'awards')),
  upload_key text not null,
  filename text not null,
  mime_type text not null,
  size bigint not null check (size > 0 and size <= 10485760),
  drive_file_id text not null unique,
  upload_url text not null,
  browser_origin text,
  staging_folder_id text not null,
  status text not null default 'initiated'
    check (status in ('initiated', 'finalizing', 'finalized', 'failed', 'expired')),
  document_id uuid references public.form_response_documents(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

create unique index if not exists direct_drive_upload_sessions_upload_key_idx
  on public.direct_drive_upload_sessions(response_id, upload_key);
create index if not exists direct_drive_upload_sessions_expiry_idx
  on public.direct_drive_upload_sessions(status, expires_at);

alter table public.direct_drive_upload_sessions enable row level security;
revoke all on table public.direct_drive_upload_sessions from anon, authenticated;
grant select, insert, update, delete on table public.direct_drive_upload_sessions to service_role;
