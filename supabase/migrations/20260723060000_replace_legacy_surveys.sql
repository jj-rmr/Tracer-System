-- Make versioned responses the only survey persistence model.
-- Existing development data is moved into the most recent study period.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM surveys)
       AND NOT EXISTS (SELECT 1 FROM study_periods) THEN
        RAISE EXCEPTION
            'Cannot migrate legacy surveys without a study period. Schedule a study first.';
    END IF;
END;
$$;

ALTER TABLE form_responses DISABLE TRIGGER trigger_enforce_open_study_response_changes;

INSERT INTO form_responses (
    study_period_id,
    user_id,
    source,
    respondent_name,
    status,
    answers,
    submitted_at,
    created_at,
    updated_at
)
SELECT
    target_study.id,
    survey.user_id,
    'alumni',
    NULLIF(CONCAT_WS(' ', survey.first_name, survey.middle_name, survey.last_name, survey.extension_name), ''),
    'submitted',
    jsonb_build_object(
        'firstName', COALESCE(survey.first_name, ''),
        'middleName', COALESCE(survey.middle_name, ''),
        'lastName', COALESCE(survey.last_name, ''),
        'extensionName', COALESCE(survey.extension_name, ''),
        'street', COALESCE(survey.street, ''),
        'barangay', COALESCE(survey.barangay, ''),
        'municipality', COALESCE(survey.municipality, ''),
        'province', COALESCE(survey.province, ''),
        'region', COALESCE(survey.region, ''),
        'contactNumbers', to_jsonb(survey.contact_numbers),
        'civilStatus', COALESCE(survey.civil_status, ''),
        'sex', COALESCE(survey.sex, ''),
        'program', COALESCE(survey.program, ''),
        'yearGraduated', COALESCE(survey.year_graduated, 0),
        'honors', to_jsonb(survey.honors),
        'trainings', to_jsonb(survey.trainings),
        'advancedStudyDegree', COALESCE(survey.advanced_study_degree, ''),
        'advancedStudyOther', COALESCE(survey.advanced_study_other, ''),
        'advancedStudyReasons', COALESCE(survey.advanced_study_reasons, ''),
        'advancedStudyReasonOther', COALESCE(survey.advanced_study_reason_other, ''),
        'employmentStatus', COALESCE(survey.employment_status, ''),
        'unemploymentReasons', to_jsonb(survey.unemployment_reasons),
        'unemploymentReasonOther', COALESCE(survey.unemployment_reason_other, ''),
        'currentEmploymentStatus', COALESCE(survey.current_employment_status, ''),
        'currentOccupation', COALESCE(survey.current_occupation, ''),
        'companyName', COALESCE(survey.company_name, ''),
        'companyAddress', COALESCE(survey.company_address, ''),
        'businessIndustry', COALESCE(survey.business_industry, ''),
        'placeOfWork', COALESCE(survey.place_of_work, ''),
        'isFirstJob', survey.is_first_job,
        'isFirstJobRelated', survey.is_first_job_related,
        'stayingReasons', to_jsonb(survey.staying_reasons),
        'stayingReasonOther', COALESCE(survey.staying_reason_other, ''),
        'acceptingReasons', to_jsonb(survey.accepting_reasons),
        'acceptingReasonOther', COALESCE(survey.accepting_reason_other, ''),
        'changingReasons', to_jsonb(survey.changing_reasons),
        'changingReasonOther', COALESCE(survey.changing_reason_other, ''),
        'firstJobDuration', COALESCE(survey.first_job_duration, ''),
        'firstJobDurationOther', COALESCE(survey.first_job_duration_other, ''),
        'firstJobSource', COALESCE(survey.first_job_source, ''),
        'firstJobSourceOther', COALESCE(survey.first_job_source_other, ''),
        'firstJobSearchDuration', COALESCE(survey.first_job_search_duration, ''),
        'firstJobSearchDurationOther', COALESCE(survey.first_job_search_duration_other, ''),
        'firstJobTitle', COALESCE(survey.first_job_title, ''),
        'firstJobLevel', COALESCE(survey.first_job_level, ''),
        'currentJobLevel', COALESCE(survey.current_job_level, ''),
        'initialMonthlyIncome', COALESCE(survey.initial_monthly_income, ''),
        'curriculumRelevant', survey.curriculum_relevant,
        'usefulCompetencies', to_jsonb(survey.useful_competencies),
        'usefulCompetencyOther', COALESCE(survey.useful_competency_other, '')
    ),
    survey.updated_at,
    survey.created_at,
    survey.updated_at
FROM surveys AS survey
CROSS JOIN LATERAL (
    SELECT id
    FROM study_periods
    ORDER BY opens_at DESC
    LIMIT 1
) AS target_study
ON CONFLICT (study_period_id, user_id) DO NOTHING;

INSERT INTO form_response_documents (
    id,
    response_id,
    document_type,
    filename,
    mime_type,
    size,
    google_drive_file_id,
    google_drive_folder_id,
    metadata,
    uploaded_at
)
SELECT
    document.id,
    response.id,
    CASE
        WHEN document.metadata->>'documentType' = 'awards' THEN 'awards'
        ELSE 'employment'
    END,
    document.filename,
    document.mime_type,
    document.size,
    document.google_drive_file_id,
    document.google_drive_folder_id,
    document.metadata,
    document.uploaded_at
FROM survey_documents AS document
JOIN surveys AS survey ON survey.id = document.survey_id
JOIN LATERAL (
    SELECT id
    FROM form_responses
    WHERE user_id = survey.user_id
    ORDER BY created_at DESC
    LIMIT 1
) AS response ON TRUE
ON CONFLICT (id) DO NOTHING;

ALTER TABLE form_responses ENABLE TRIGGER trigger_enforce_open_study_response_changes;

DROP TABLE survey_documents;
DROP TABLE surveys;

DROP INDEX IF EXISTS idx_form_responses_import_reference;
ALTER TABLE form_responses DROP COLUMN external_reference;

REVOKE ALL ON TABLE form_response_documents FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE form_response_documents TO service_role;
