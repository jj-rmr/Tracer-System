-- ==========================================================
-- Tracer System Database Schema
-- Appwrite Authentication + Supabase Database
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE surveys (

    -- ======================================================
    -- System
    -- ======================================================

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- ======================================================
    -- Personal Information
    -- ======================================================

    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    extension_name TEXT,

    street TEXT,
    barangay TEXT,
    municipality TEXT,
    province TEXT,
    region TEXT,

    contact_numbers TEXT[] NOT NULL DEFAULT '{}',

    civil_status TEXT,
    sex TEXT,

    -- ======================================================
    -- Education
    -- ======================================================

    program TEXT,
    year_graduated INTEGER,

    honors TEXT[] NOT NULL DEFAULT '{}',
    trainings TEXT[] NOT NULL DEFAULT '{}',

    -- ======================================================
    -- Graduate Studies
    -- ======================================================

    advanced_study_degree TEXT,
    advanced_study_other TEXT,

    advanced_study_reasons TEXT,
    advanced_study_reason_other TEXT,

    -- ======================================================
    -- Employment
    -- ======================================================

    employment_status TEXT,

    unemployment_reasons TEXT[] NOT NULL DEFAULT '{}',
    unemployment_reason_other TEXT,

    current_employment_status TEXT,
    current_occupation TEXT,

    company_name TEXT,
    company_address TEXT,

    business_industry TEXT,

    place_of_work TEXT,

    -- ======================================================
    -- Google Drive
    -- ======================================================

    graduate_folder_id TEXT,
    document_type TEXT NOT NULL,

    -- ======================================================
    -- First Job
    -- ======================================================

    is_first_job BOOLEAN NOT NULL DEFAULT FALSE,

    is_first_job_related BOOLEAN NOT NULL DEFAULT FALSE,

    staying_reasons TEXT[] NOT NULL DEFAULT '{}',
    staying_reason_other TEXT,

    accepting_reasons TEXT[] NOT NULL DEFAULT '{}',
    accepting_reason_other TEXT,

    changing_reasons TEXT[] NOT NULL DEFAULT '{}',
    changing_reason_other TEXT,

    first_job_duration TEXT,
    first_job_duration_other TEXT,

    first_job_source TEXT,
    first_job_source_other TEXT,

    first_job_search_duration TEXT,
    first_job_search_duration_other TEXT,

    first_job_title TEXT,

    first_job_level TEXT,
    current_job_level TEXT,

    initial_monthly_income TEXT,

    -- ======================================================
    -- Curriculum
    -- ======================================================

    curriculum_relevant BOOLEAN NOT NULL DEFAULT FALSE,

    useful_competencies TEXT[] NOT NULL DEFAULT '{}',
    useful_competency_other TEXT
);

-- ==========================================================
-- Survey Documents
-- ==========================================================

CREATE TABLE survey_documents (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    survey_id UUID NOT NULL
        REFERENCES surveys(id)
        ON DELETE CASCADE,

    filename TEXT NOT NULL,

    mime_type TEXT NOT NULL,

    size BIGINT NOT NULL,

    google_drive_file_id TEXT NOT NULL,

    google_drive_folder_id TEXT NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- Indexes
-- ==========================================================

CREATE UNIQUE INDEX idx_surveys_user_id
ON surveys(user_id);

CREATE INDEX idx_surveys_last_name
ON surveys(last_name);

CREATE INDEX idx_surveys_first_name
ON surveys(first_name);

CREATE INDEX idx_surveys_program
ON surveys(program);

CREATE INDEX idx_surveys_year_graduated
ON surveys(year_graduated);

CREATE INDEX idx_surveys_employment_status
ON surveys(employment_status);

CREATE INDEX idx_surveys_created_at
ON surveys(created_at DESC);

CREATE INDEX idx_survey_documents_survey_id
ON survey_documents(survey_id);

CREATE INDEX idx_survey_documents_drive_file_id
ON survey_documents(google_drive_file_id);

-- ==========================================================
-- Updated At Trigger
-- ==========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_surveys_updated_at
BEFORE UPDATE
ON surveys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();