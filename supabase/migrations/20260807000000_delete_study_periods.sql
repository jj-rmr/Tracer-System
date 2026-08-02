CREATE OR REPLACE FUNCTION delete_study_period(target_study_period_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    deleted_response_count INTEGER;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM study_periods WHERE id = target_study_period_id
    ) THEN
        RETURN NULL;
    END IF;

    -- Lock the study and temporarily satisfy the response/document lifecycle
    -- triggers. This state is only visible inside this transaction; deleting the
    -- parent row later in the function makes it impossible to reopen publicly.
    UPDATE study_periods
    SET lifecycle_status = 'open'
    WHERE id = target_study_period_id;

    DELETE FROM form_responses
    WHERE study_period_id = target_study_period_id;
    GET DIAGNOSTICS deleted_response_count = ROW_COUNT;

    DELETE FROM study_periods
    WHERE id = target_study_period_id;

    RETURN deleted_response_count;
END;
$$;

REVOKE ALL ON FUNCTION delete_study_period(UUID)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_study_period(UUID) TO service_role;
