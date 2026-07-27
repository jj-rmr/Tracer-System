-- Keep optimistic draft concurrency tied to response content. Background Drive
-- organization and deletion lifecycle updates must not make an editor stale.
CREATE OR REPLACE FUNCTION update_form_response_content_updated_at()
RETURNS TRIGGER AS
$$
BEGIN
    IF ROW(
        NEW.study_period_id,
        NEW.user_id,
        NEW.source,
        NEW.respondent_name,
        NEW.respondent_email,
        NEW.entered_by_user_id,
        NEW.status,
        NEW.answers,
        NEW.submitted_at,
        NEW.import_token
    ) IS DISTINCT FROM ROW(
        OLD.study_period_id,
        OLD.user_id,
        OLD.source,
        OLD.respondent_name,
        OLD.respondent_email,
        OLD.entered_by_user_id,
        OLD.status,
        OLD.answers,
        OLD.submitted_at,
        OLD.import_token
    ) THEN
        NEW.updated_at = NOW();
    ELSE
        NEW.updated_at = OLD.updated_at;
    END IF;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_form_responses_updated_at ON form_responses;

CREATE TRIGGER trigger_form_responses_updated_at
BEFORE UPDATE ON form_responses
FOR EACH ROW
EXECUTE FUNCTION update_form_response_content_updated_at();
