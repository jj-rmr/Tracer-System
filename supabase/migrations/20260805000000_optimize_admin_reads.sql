-- Replace per-study response count queries and recursive application-side
-- Drive ancestry lookups with single database operations.

CREATE OR REPLACE VIEW study_period_summaries AS
SELECT
    study.*,
    study.lifecycle_status AS status,
    COUNT(response.id) FILTER (
        WHERE response.import_status = 'completed'
          AND response.deletion_status = 'active'
    )::BIGINT AS response_count,
    COUNT(response.id) FILTER (
        WHERE response.import_status = 'completed'
          AND response.deletion_status = 'active'
          AND response.status = 'submitted'
    )::BIGINT AS submitted_response_count
FROM study_periods AS study
LEFT JOIN form_responses AS response
  ON response.study_period_id = study.id
GROUP BY study.id;

ALTER VIEW study_period_summaries SET (security_invoker = true);
REVOKE ALL ON TABLE study_period_summaries FROM anon, authenticated;
GRANT SELECT ON TABLE study_period_summaries TO service_role;

CREATE OR REPLACE FUNCTION indexed_drive_ancestry(
    target_file_id TEXT,
    target_root_id TEXT
)
RETURNS TABLE (
    google_drive_file_id TEXT,
    root_google_drive_folder_id TEXT,
    parent_google_drive_folder_id TEXT,
    name TEXT,
    mime_type TEXT,
    is_folder BOOLEAN,
    size BIGINT,
    modified_at TIMESTAMPTZ,
    web_view_link TEXT,
    depth INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    WITH RECURSIVE ancestry AS (
        SELECT item.*, 0 AS depth, ARRAY[item.google_drive_file_id] AS path
        FROM google_drive_items AS item
        WHERE item.google_drive_file_id = target_file_id
          AND item.root_google_drive_folder_id = target_root_id

        UNION ALL

        SELECT parent.*, child.depth + 1,
               child.path || parent.google_drive_file_id
        FROM ancestry AS child
        JOIN google_drive_items AS parent
          ON parent.google_drive_file_id = child.parent_google_drive_folder_id
         AND parent.root_google_drive_folder_id = target_root_id
        WHERE NOT parent.google_drive_file_id = ANY(child.path)
    )
    SELECT
        ancestry.google_drive_file_id,
        ancestry.root_google_drive_folder_id,
        ancestry.parent_google_drive_folder_id,
        ancestry.name,
        ancestry.mime_type,
        ancestry.is_folder,
        ancestry.size,
        ancestry.modified_at,
        ancestry.web_view_link,
        ancestry.depth
    FROM ancestry
    ORDER BY ancestry.depth DESC;
$$;

REVOKE ALL ON FUNCTION indexed_drive_ancestry(TEXT, TEXT)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION indexed_drive_ancestry(TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION is_indexed_drive_descendant(
    target_file_id TEXT,
    target_ancestor_id TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    WITH RECURSIVE ancestry AS (
        SELECT
            item.google_drive_file_id,
            item.parent_google_drive_folder_id,
            item.root_google_drive_folder_id,
            ARRAY[item.google_drive_file_id] AS path
        FROM google_drive_items AS item
        WHERE item.google_drive_file_id = target_file_id

        UNION ALL

        SELECT
            parent.google_drive_file_id,
            parent.parent_google_drive_folder_id,
            parent.root_google_drive_folder_id,
            child.path || parent.google_drive_file_id
        FROM ancestry AS child
        JOIN google_drive_items AS parent
          ON parent.google_drive_file_id = child.parent_google_drive_folder_id
         AND parent.root_google_drive_folder_id = child.root_google_drive_folder_id
        WHERE NOT parent.google_drive_file_id = ANY(child.path)
    )
    SELECT EXISTS (
        SELECT 1 FROM ancestry
        WHERE google_drive_file_id = target_ancestor_id
    );
$$;

REVOKE ALL ON FUNCTION is_indexed_drive_descendant(TEXT, TEXT)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION is_indexed_drive_descendant(TEXT, TEXT)
TO service_role;
