-- Repair environments where the staged-upload migration was recorded before
-- upload_status and its final lifecycle trigger were added to that migration.

ALTER TABLE form_response_documents
ADD COLUMN IF NOT EXISTS upload_status TEXT NOT NULL DEFAULT 'ready';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'form_response_documents_upload_status_check'
          AND conrelid = 'form_response_documents'::regclass
    ) THEN
        ALTER TABLE form_response_documents
        ADD CONSTRAINT form_response_documents_upload_status_check
        CHECK (upload_status IN ('staged', 'ready'));
    END IF;
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
    target_response_id := CASE
        WHEN TG_OP = 'DELETE' THEN OLD.response_id
        ELSE NEW.response_id
    END;

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

DROP TRIGGER IF EXISTS trigger_enforce_response_document_changes
ON form_response_documents;

CREATE TRIGGER trigger_enforce_response_document_changes
BEFORE INSERT OR UPDATE OR DELETE ON form_response_documents
FOR EACH ROW
EXECUTE FUNCTION enforce_response_document_changes();
