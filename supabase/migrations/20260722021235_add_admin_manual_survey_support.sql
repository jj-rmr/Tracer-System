-- Allow surveys to exist without an Appwrite user account
ALTER TABLE surveys
ALTER COLUMN user_id DROP NOT NULL;

-- Track how the survey was created
ALTER TABLE surveys
ADD COLUMN entry_source TEXT NOT NULL DEFAULT 'self'
CHECK (entry_source IN ('self', 'admin_manual'));

-- Track which admin created the manual survey
ALTER TABLE surveys
ADD COLUMN created_by TEXT;