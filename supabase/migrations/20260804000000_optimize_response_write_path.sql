-- Collapse stable study context reads and alumni response writes into one
-- database round trip. The advisory transaction lock serializes first writes
-- and cross-tab writes for the same study/user pair before comparing answers.

CREATE OR REPLACE VIEW study_contexts AS
SELECT
    study.*,
    study.lifecycle_status AS status,
    version.definition
FROM study_periods AS study
JOIN form_versions AS version
  ON version.form_id = study.form_id
 AND version.id = study.form_version_id;

ALTER VIEW study_contexts SET (security_invoker = true);
REVOKE ALL ON TABLE study_contexts FROM anon, authenticated;
GRANT SELECT ON TABLE study_contexts TO service_role;

CREATE OR REPLACE FUNCTION save_alumni_form_response(
    target_study_period_id UUID,
    target_user_id TEXT,
    next_status TEXT,
    next_answers JSONB,
    expected_content_updated_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    existing form_responses%ROWTYPE;
    saved form_responses%ROWTYPE;
    organization_changed BOOLEAN;
BEGIN
    IF next_status NOT IN ('draft', 'submitted') THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid response status';
    END IF;

    PERFORM pg_advisory_xact_lock(
        hashtextextended(target_study_period_id::TEXT || ':' || target_user_id, 0)
    );

    SELECT * INTO existing
    FROM form_responses
    WHERE study_period_id = target_study_period_id
      AND user_id = target_user_id
      AND deletion_status = 'active'
    FOR UPDATE;

    IF expected_content_updated_at IS NOT NULL AND (
        existing.id IS NULL OR existing.updated_at <> expected_content_updated_at
    ) THEN
        RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'STALE_FORM_RESPONSE';
    END IF;

    organization_changed := existing.id IS NULL OR EXISTS (
        SELECT 1
        FROM unnest(ARRAY[
            'firstName', 'middleName', 'lastName', 'extensionName', 'program'
        ]) AS field_key
        WHERE existing.answers->field_key IS DISTINCT FROM next_answers->field_key
    );

    INSERT INTO form_responses (
        study_period_id,
        user_id,
        status,
        answers,
        submitted_at,
        drive_organization_status,
        drive_organization_error
    ) VALUES (
        target_study_period_id,
        target_user_id,
        next_status,
        next_answers,
        CASE WHEN next_status = 'submitted' THEN NOW() ELSE NULL END,
        CASE WHEN organization_changed THEN 'pending' ELSE 'organized' END,
        NULL
    )
    ON CONFLICT (study_period_id, user_id) DO UPDATE SET
        status = EXCLUDED.status,
        answers = EXCLUDED.answers,
        submitted_at = EXCLUDED.submitted_at,
        drive_organization_status = CASE
            WHEN organization_changed THEN 'pending'
            ELSE form_responses.drive_organization_status
        END,
        drive_organization_error = CASE
            WHEN organization_changed THEN NULL
            ELSE form_responses.drive_organization_error
        END
    RETURNING * INTO saved;

    RETURN jsonb_build_object(
        'response', to_jsonb(saved),
        'shouldOrganize', organization_changed
    );
END;
$$;

REVOKE ALL ON FUNCTION save_alumni_form_response(UUID, TEXT, TEXT, JSONB, TIMESTAMPTZ)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION save_alumni_form_response(UUID, TEXT, TEXT, JSONB, TIMESTAMPTZ)
TO service_role;
