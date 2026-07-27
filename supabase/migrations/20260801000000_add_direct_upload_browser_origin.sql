alter table public.direct_drive_upload_sessions
  add column if not exists browser_origin text;
