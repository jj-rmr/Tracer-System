-- The application accesses Supabase exclusively through authenticated server
-- routes using SUPABASE_SECRET_KEY. Keep all public-schema application data
-- inaccessible to browser roles while allowing the service role to operate.

ALTER TABLE form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_response_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_folders ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE form_definitions FROM anon, authenticated;
REVOKE ALL ON TABLE form_versions FROM anon, authenticated;
REVOKE ALL ON TABLE study_periods FROM anon, authenticated;
REVOKE ALL ON TABLE form_responses FROM anon, authenticated;
REVOKE ALL ON TABLE form_response_documents FROM anon, authenticated;
REVOKE ALL ON TABLE google_drive_folders FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE
    form_definitions,
    form_versions,
    study_periods,
    form_responses,
    form_response_documents,
    google_drive_folders
TO service_role;

ALTER VIEW study_periods_with_status SET (security_invoker = true);
ALTER VIEW admin_response_summaries SET (security_invoker = true);

REVOKE ALL ON TABLE study_periods_with_status FROM anon, authenticated;
REVOKE ALL ON TABLE admin_response_summaries FROM anon, authenticated;

GRANT SELECT ON TABLE study_periods_with_status TO service_role;
GRANT SELECT ON TABLE admin_response_summaries TO service_role;
