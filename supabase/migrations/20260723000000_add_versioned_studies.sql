-- Versioned forms and academic-year study periods.
-- The existing surveys table remains active until its data is migrated.

CREATE TABLE form_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE form_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES form_definitions(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK (version > 0),
    definition JSONB NOT NULL CHECK (jsonb_typeof(definition) = 'object'),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (form_id, version),
    UNIQUE (form_id, id)
);

CREATE TABLE study_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES form_definitions(id) ON DELETE RESTRICT,
    form_version_id UUID NOT NULL,
    academic_year TEXT NOT NULL
        CHECK (academic_year ~ '^[0-9]{4}-[0-9]{4}$')
        CHECK (
            RIGHT(academic_year, 4)::INTEGER
            = LEFT(academic_year, 4)::INTEGER + 1
        ),
    title TEXT NOT NULL,
    opens_at TIMESTAMPTZ NOT NULL,
    closes_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (closes_at > opens_at),
    UNIQUE (form_id, academic_year),
    FOREIGN KEY (form_id, form_version_id)
        REFERENCES form_versions(form_id, id)
        ON DELETE RESTRICT
);

CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_period_id UUID NOT NULL
        REFERENCES study_periods(id)
        ON DELETE RESTRICT,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted')),
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (study_period_id, user_id),
    CHECK (
        (status = 'draft' AND submitted_at IS NULL)
        OR
        (status = 'submitted' AND submitted_at IS NOT NULL)
    )
);

CREATE INDEX idx_form_versions_form_id
ON form_versions(form_id, version DESC);

CREATE INDEX idx_study_periods_schedule
ON study_periods(opens_at, closes_at);

CREATE INDEX idx_study_periods_archived_at
ON study_periods(archived_at);

CREATE INDEX idx_form_responses_study_period
ON form_responses(study_period_id);

CREATE INDEX idx_form_responses_user
ON form_responses(user_id);

CREATE OR REPLACE FUNCTION prevent_published_form_version_changes()
RETURNS TRIGGER AS
$$
BEGIN
    IF OLD.published_at IS NOT NULL THEN
        RAISE EXCEPTION 'Published form versions are immutable';
    END IF;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_published_form_version_changes
BEFORE UPDATE OR DELETE
ON form_versions
FOR EACH ROW
EXECUTE FUNCTION prevent_published_form_version_changes();

CREATE OR REPLACE FUNCTION enforce_open_study_response_changes()
RETURNS TRIGGER AS
$$
DECLARE
    target_study_id UUID;
    study study_periods%ROWTYPE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_study_id := OLD.study_period_id;
    ELSE
        target_study_id := NEW.study_period_id;
    END IF;

    SELECT * INTO study
    FROM study_periods
    WHERE id = target_study_id;

    IF study.archived_at IS NOT NULL THEN
        RAISE EXCEPTION 'Archived study responses are read-only';
    END IF;

    IF NOW() < study.opens_at OR NOW() >= study.closes_at THEN
        RAISE EXCEPTION 'Study responses can only be changed while the study is open';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_open_study_response_changes
BEFORE INSERT OR UPDATE OR DELETE
ON form_responses
FOR EACH ROW
EXECUTE FUNCTION enforce_open_study_response_changes();

CREATE VIEW study_periods_with_status AS
SELECT
    study_periods.*,
    CASE
        WHEN archived_at IS NOT NULL THEN 'archived'
        WHEN NOW() < opens_at THEN 'upcoming'
        WHEN NOW() < closes_at THEN 'open'
        ELSE 'closed'
    END AS status
FROM study_periods;

CREATE TRIGGER trigger_form_definitions_updated_at
BEFORE UPDATE ON form_definitions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_form_versions_updated_at
BEFORE UPDATE ON form_versions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_study_periods_updated_at
BEFORE UPDATE ON study_periods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_form_responses_updated_at
BEFORE UPDATE ON form_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
