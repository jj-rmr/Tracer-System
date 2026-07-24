-- Coordinate Google Drive folder creation across concurrent server instances.

CREATE TABLE google_drive_folders (
    folder_key TEXT PRIMARY KEY,
    google_drive_folder_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    parent_google_drive_folder_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_google_drive_folders_updated_at
BEFORE UPDATE ON google_drive_folders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

REVOKE ALL ON TABLE google_drive_folders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE google_drive_folders
TO service_role;
