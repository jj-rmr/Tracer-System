-- ==========================================================
-- Tracer System Database Schema
-- Appwrite Authentication + Supabase Database
-- Single Table Design (Demo Version)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE surveys (

    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Appwrite User
    user_id TEXT NOT NULL UNIQUE,

    -- Name
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    extension_name TEXT,

    -- Address
    street TEXT,
    barangay TEXT,
    municipality TEXT,
    province TEXT,
    region TEXT,

    -- Contact
    contact_numbers TEXT[],

    -- Personal
    civil_status TEXT,
    sex TEXT,

    -- Education
    year_graduated INTEGER,

    honors TEXT[],
    trainings TEXT[],

    -- Graduate Studies
    advance_study_degree TEXT,
    advance_study_other TEXT,

    advance_study_reasons TEXT,
    advance_study_reason_other TEXT,

    -- Employment
    employment_status TEXT,

    unemployment_reasons TEXT[],
    unemployment_reason_other TEXT,

    present_employment_status TEXT,

    present_occupation TEXT,

    company_name TEXT,
    company_address TEXT,

    business_industry TEXT,

    place_of_work TEXT,

    -- Documents
    employment_documents TEXT[],
    award_documents TEXT[],

    -- First Job
    is_first_job BOOLEAN DEFAULT FALSE,

    is_first_job_related BOOLEAN DEFAULT FALSE,

    staying_reasons TEXT[],
    staying_reason_other TEXT,

    accepting_reasons TEXT[],
    accepting_reason_other TEXT,

    changing_reasons TEXT[],
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

    -- Curriculum
    curriculum_relevant BOOLEAN DEFAULT FALSE,

    useful_competencies TEXT[],
    useful_competency_other TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE UNIQUE INDEX idx_surveys_user_id
ON surveys(user_id);

CREATE INDEX idx_surveys_last_name
ON surveys(last_name);

CREATE INDEX idx_surveys_first_name
ON surveys(first_name);

CREATE INDEX idx_surveys_created_at
ON surveys(created_at DESC);

-- ==========================================================
-- UPDATED AT TRIGGER
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