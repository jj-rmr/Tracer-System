-- Index the managed Google Drive tree for fast browsing and reconciliation.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE google_drive_items (
    google_drive_file_id TEXT PRIMARY KEY,
    root_google_drive_folder_id TEXT NOT NULL,
    parent_google_drive_folder_id TEXT,
    name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    is_folder BOOLEAN NOT NULL,
    size BIGINT,
    modified_at TIMESTAMPTZ,
    web_view_link TEXT,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_google_drive_items_parent
ON google_drive_items(root_google_drive_folder_id, parent_google_drive_folder_id, is_folder, name);

CREATE INDEX idx_google_drive_items_name_search
ON google_drive_items USING GIN (LOWER(name) gin_trgm_ops);

CREATE TRIGGER trigger_google_drive_items_updated_at
BEFORE UPDATE ON google_drive_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE google_drive_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE google_drive_items FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE google_drive_items TO service_role;
