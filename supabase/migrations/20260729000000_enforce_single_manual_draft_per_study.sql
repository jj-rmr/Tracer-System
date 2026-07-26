create unique index if not exists form_responses_one_manual_draft_per_admin_study
  on public.form_responses (entered_by_user_id, study_period_id)
  where source = 'admin_import'
    and status = 'draft'
    and import_status = 'processing'
    and deletion_status = 'active';
