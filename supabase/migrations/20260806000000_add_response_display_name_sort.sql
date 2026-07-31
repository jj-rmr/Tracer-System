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
    response.import_status,
    response.deletion_status,
    response.drive_organization_status,
    response.drive_organization_error,
    study.lifecycle_status AS study_status,
    LOWER(
        COALESCE(
            NULLIF(TRIM(response.respondent_name), ''),
            NULLIF(
                TRIM(CONCAT_WS(
                    ' ',
                    response.answers->>'lastName',
                    response.answers->>'firstName',
                    response.answers->>'middleName',
                    response.answers->>'extensionName'
                )),
                ''
            ),
            'unnamed respondent'
        )
    ) AS sort_name
FROM form_responses AS response
JOIN study_periods AS study ON study.id = response.study_period_id;

ALTER VIEW admin_response_summaries SET (security_invoker = true);
REVOKE ALL ON TABLE admin_response_summaries FROM anon, authenticated;
GRANT SELECT ON TABLE admin_response_summaries TO service_role;
