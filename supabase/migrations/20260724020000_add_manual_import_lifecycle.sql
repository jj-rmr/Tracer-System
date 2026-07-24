-- Make multi-request manual imports retryable and hide incomplete responses.

ALTER TABLE form_responses
ADD COLUMN import_status TEXT NOT NULL DEFAULT 'completed'
    CHECK (import_status IN ('processing', 'completed', 'failed')),
ADD COLUMN import_token UUID;

ALTER TABLE form_responses
ADD CONSTRAINT form_responses_import_lifecycle_check CHECK (
    source = 'admin_import'
    OR (import_status = 'completed' AND import_token IS NULL)
);

CREATE UNIQUE INDEX idx_form_responses_import_token
ON form_responses(import_token)
WHERE source = 'admin_import' AND import_token IS NOT NULL;

ALTER TABLE form_response_documents
ADD COLUMN upload_key UUID;

CREATE UNIQUE INDEX idx_form_response_documents_upload_key
ON form_response_documents(response_id, upload_key)
WHERE upload_key IS NOT NULL;

CREATE OR REPLACE VIEW admin_response_summaries AS
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
    response.search_text,
    response.import_status
FROM form_responses AS response
JOIN study_periods AS study ON study.id = response.study_period_id;

REVOKE ALL ON TABLE admin_response_summaries FROM anon, authenticated;
GRANT SELECT ON TABLE admin_response_summaries TO service_role;
