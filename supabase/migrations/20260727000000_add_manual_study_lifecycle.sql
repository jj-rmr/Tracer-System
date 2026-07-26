-- Replace scheduled study windows with an explicit manual open/closed state.

ALTER TABLE study_periods
ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'closed'
    CHECK (lifecycle_status IN ('open', 'closed'));

UPDATE study_periods
SET lifecycle_status = CASE
    WHEN archived_at IS NULL AND NOW() >= opens_at AND NOW() < closes_at
        THEN 'open'
    ELSE 'closed'
END;

DROP VIEW study_periods_with_status;

CREATE VIEW study_periods_with_status AS
SELECT
    study_periods.*,
    lifecycle_status AS status
FROM study_periods;

REVOKE ALL ON TABLE study_periods_with_status FROM anon, authenticated;
GRANT SELECT ON TABLE study_periods_with_status TO service_role;

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
    study.lifecycle_status AS study_status
FROM form_responses AS response
JOIN study_periods AS study ON study.id = response.study_period_id;

REVOKE ALL ON TABLE admin_response_summaries FROM anon, authenticated;
GRANT SELECT ON TABLE admin_response_summaries TO service_role;

CREATE OR REPLACE FUNCTION enforce_open_study_response_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_study_id UUID;
    study study_periods%ROWTYPE;
    operational_update BOOLEAN := FALSE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_study_id := OLD.study_period_id;
    ELSE
        target_study_id := NEW.study_period_id;
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
            NEW.submitted_at IS NOT DISTINCT FROM OLD.submitted_at AND
            (
                NEW.deletion_status IS NOT DISTINCT FROM OLD.deletion_status OR
                (OLD.deletion_status = 'deleting' AND NEW.deletion_status = 'delete_failed')
            );

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

    IF study.lifecycle_status <> 'open' THEN
        RAISE EXCEPTION 'Closed study responses are read-only';
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
       AND target_study.lifecycle_status <> 'open' THEN
        RAISE EXCEPTION 'Closed study documents are read-only';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;
