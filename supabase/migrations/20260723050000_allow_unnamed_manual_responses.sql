ALTER TABLE form_responses
DROP CONSTRAINT form_responses_identity_check;

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
        AND user_id IS NULL
        AND entered_by_user_id IS NOT NULL
    )
);
