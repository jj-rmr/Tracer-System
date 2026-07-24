-- Keep admin response searching and pagination inside PostgreSQL.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE form_responses
ADD COLUMN search_text TEXT GENERATED ALWAYS AS (
    LOWER(
        COALESCE(respondent_name, '') || ' ' ||
        COALESCE(respondent_email, '') || ' ' ||
        COALESCE(answers->>'firstName', '') || ' ' ||
        COALESCE(answers->>'middleName', '') || ' ' ||
        COALESCE(answers->>'lastName', '') || ' ' ||
        COALESCE(answers->>'program', '')
    )
) STORED;

CREATE INDEX idx_form_responses_search_text
ON form_responses
USING GIN (search_text gin_trgm_ops);

CREATE INDEX idx_form_responses_admin_sort
ON form_responses(created_at DESC, id DESC);

CREATE INDEX idx_form_responses_source_status
ON form_responses(source, status);

CREATE INDEX idx_form_responses_program
ON form_responses((answers->>'program'));

CREATE INDEX idx_form_responses_employment_status
ON form_responses((answers->>'employmentStatus'));

CREATE VIEW admin_response_summaries AS
SELECT
    response.id,
    response.study_period_id,
    study.academic_year,
    study.title AS study_title,
    response.source,
    response.status,
    response.respondent_name,
    response.respondent_email,
    response.answers->>'firstName' AS first_name,
    response.answers->>'middleName' AS middle_name,
    response.answers->>'lastName' AS last_name,
    response.answers->>'extensionName' AS extension_name,
    response.answers->>'sex' AS sex,
    response.answers->>'civilStatus' AS civil_status,
    response.answers->>'employmentStatus' AS employment_status,
    response.answers->>'program' AS program,
    response.submitted_at,
    response.created_at,
    response.search_text
FROM form_responses AS response
JOIN study_periods AS study ON study.id = response.study_period_id;

REVOKE ALL ON TABLE admin_response_summaries FROM anon, authenticated;
GRANT SELECT ON TABLE admin_response_summaries TO service_role;
