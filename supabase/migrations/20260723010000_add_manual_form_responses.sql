-- Allow administrators to transcribe historical Google Forms responses.

ALTER TABLE form_responses
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE form_responses
ADD COLUMN source TEXT NOT NULL DEFAULT 'alumni'
    CHECK (source IN ('alumni', 'admin_import')),
ADD COLUMN respondent_name TEXT,
ADD COLUMN respondent_email TEXT,
ADD COLUMN external_reference TEXT,
ADD COLUMN entered_by_user_id TEXT;

ALTER TABLE form_responses
ADD CONSTRAINT form_responses_identity_check CHECK (
    (
        source = 'alumni'
        AND user_id IS NOT NULL
        AND entered_by_user_id IS NULL
    )
    OR
    (
        source = 'admin_import'
        AND respondent_name IS NOT NULL
        AND entered_by_user_id IS NOT NULL
    )
);

CREATE UNIQUE INDEX idx_form_responses_import_reference
ON form_responses(study_period_id, external_reference)
WHERE source = 'admin_import' AND external_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION enforce_open_study_response_changes()
RETURNS TRIGGER AS
$$
DECLARE
    target_study_id UUID;
    response_source TEXT;
    study study_periods%ROWTYPE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_study_id := OLD.study_period_id;
        response_source := OLD.source;
    ELSE
        target_study_id := NEW.study_period_id;
        response_source := NEW.source;
    END IF;

    SELECT * INTO study
    FROM study_periods
    WHERE id = target_study_id;

    IF study.archived_at IS NOT NULL THEN
        RAISE EXCEPTION 'Archived study responses are read-only';
    END IF;

    IF response_source <> 'admin_import'
       AND (NOW() < study.opens_at OR NOW() >= study.closes_at) THEN
        RAISE EXCEPTION 'Study responses can only be changed while the study is open';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
