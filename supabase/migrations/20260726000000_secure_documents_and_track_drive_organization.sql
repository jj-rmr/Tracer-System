-- Protect response documents with the same lifecycle as their response and
-- make automatic Drive organization observable and retryable.

ALTER TABLE form_responses
ADD COLUMN drive_organization_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (drive_organization_status IN ('pending', 'organizing', 'organized', 'failed')),
ADD COLUMN drive_organization_error TEXT,
ADD COLUMN drive_organized_at TIMESTAMPTZ;

CREATE INDEX idx_form_responses_drive_organization_status
ON form_responses(drive_organization_status);

ALTER TABLE form_response_documents
ADD COLUMN upload_status TEXT NOT NULL DEFAULT 'ready'
    CHECK (upload_status IN ('staged', 'ready'));

CREATE OR REPLACE FUNCTION enforce_open_study_response_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_study_id UUID;
    response_source TEXT;
    study study_periods%ROWTYPE;
    operational_update BOOLEAN := FALSE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_study_id := OLD.study_period_id;
        response_source := OLD.source;
    ELSE
        target_study_id := NEW.study_period_id;
        response_source := NEW.source;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        operational_update :=
            NEW.study_period_id IS NOT DISTINCT FROM OLD.study_period_id AND
            NEW.user_id IS NOT DISTINCT FROM OLD.user_id AND
            NEW.source IS NOT DISTINCT FROM OLD.source AND
            NEW.respondent_name IS NOT DISTINCT FROM OLD.respondent_name AND
            NEW.respondent_email IS NOT DISTINCT FROM OLD.respondent_email AND
            NEW.entered_by_user_id IS NOT DISTINCT FROM OLD.entered_by_user_id AND
            NEW.status IS NOT DISTINCT FROM OLD.status AND
            NEW.answers IS NOT DISTINCT FROM OLD.answers AND
            NEW.submitted_at IS NOT DISTINCT FROM OLD.submitted_at;

        IF operational_update THEN
            RETURN NEW;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' AND OLD.deletion_status = 'deleting' THEN
        RETURN OLD;
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
$$;

CREATE OR REPLACE FUNCTION enforce_response_document_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_response form_responses%ROWTYPE;
    target_study study_periods%ROWTYPE;
    target_response_id UUID;
BEGIN
    target_response_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.response_id ELSE NEW.response_id END;

    IF TG_OP = 'DELETE' AND OLD.upload_status = 'staged' THEN
        RETURN OLD;
    END IF;

    SELECT * INTO target_response
    FROM form_responses
    WHERE id = target_response_id;

    SELECT * INTO target_study
    FROM study_periods
    WHERE id = target_response.study_period_id;

    IF target_response.deletion_status <> 'deleting'
       AND target_study.archived_at IS NOT NULL THEN
        RAISE EXCEPTION 'Archived study documents are read-only';
    END IF;

    IF target_response.source = 'alumni'
       AND target_response.deletion_status <> 'deleting'
       AND NOT (NOW() >= target_study.opens_at AND NOW() < target_study.closes_at) THEN
        RAISE EXCEPTION 'Study documents can only be changed while the study is open';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_enforce_response_document_changes
BEFORE INSERT OR UPDATE OR DELETE ON form_response_documents
FOR EACH ROW
EXECUTE FUNCTION enforce_response_document_changes();

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
    response.drive_organization_error
FROM form_responses AS response
JOIN study_periods AS study ON study.id = response.study_period_id;

REVOKE ALL ON TABLE admin_response_summaries FROM anon, authenticated;
GRANT SELECT ON TABLE admin_response_summaries TO service_role;
