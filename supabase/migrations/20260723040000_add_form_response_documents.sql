CREATE TABLE form_response_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL
        REFERENCES form_responses(id)
        ON DELETE CASCADE,
    document_type TEXT NOT NULL
        CHECK (document_type IN ('employment', 'awards')),
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    google_drive_file_id TEXT NOT NULL,
    google_drive_folder_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_form_response_documents_response_id
ON form_response_documents(response_id);

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE form_response_documents
TO authenticated, service_role;
