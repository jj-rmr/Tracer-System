-- The application accesses study data only through authenticated server routes.
-- Grant the Supabase service role explicit access without exposing these objects
-- to anon or authenticated browser clients.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE form_definitions
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE form_versions
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE study_periods
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE form_responses
TO service_role;

GRANT SELECT
ON TABLE study_periods_with_status
TO service_role;
