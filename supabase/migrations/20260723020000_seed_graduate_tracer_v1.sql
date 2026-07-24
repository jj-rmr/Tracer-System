-- Seed the built-in Graduate Tracer form and publish version 1.
-- Existing records are preserved so this migration is idempotent.

INSERT INTO form_definitions (slug, title, description)
VALUES (
    'graduate-tracer',
    'Graduate Tracer Study',
    'Collects graduate education, employment, and curriculum feedback.'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO form_versions (form_id, version, definition, published_at)
SELECT
    id,
    1,
    $definition$
    {
      "slug": "graduate-tracer",
      "version": 1,
      "title": "Graduate Tracer Study",
      "description": "Collects graduate education, employment, and curriculum feedback.",
      "sections": [
        {
          "id": "personal-information",
          "title": "Personal Information",
          "fieldKeys": [
            "firstName", "middleName", "lastName", "extensionName",
            "street", "barangay", "municipality", "province", "region",
            "civilStatus", "sex", "contactNumbers"
          ]
        },
        {
          "id": "academic-background",
          "title": "Academic Background",
          "fieldKeys": [
            "program", "yearGraduated", "honors", "trainings",
            "advancedStudyDegree", "advancedStudyOther",
            "advancedStudyReasons", "advancedStudyReasonOther"
          ]
        },
        {
          "id": "employment-profile",
          "title": "Employment Profile",
          "fieldKeys": [
            "employmentStatus", "currentEmploymentStatus",
            "currentOccupation", "companyName", "companyAddress",
            "businessIndustry", "placeOfWork", "unemploymentReasons",
            "unemploymentReasonOther"
          ]
        },
        {
          "id": "job-and-curriculum",
          "title": "First Job and Curriculum Feedback",
          "fieldKeys": [
            "isFirstJob", "isFirstJobRelated", "stayingReasons",
            "stayingReasonOther", "acceptingReasons",
            "acceptingReasonOther", "changingReasons",
            "changingReasonOther", "firstJobTitle",
            "firstJobSearchDuration", "firstJobSearchDurationOther",
            "firstJobDuration", "firstJobDurationOther", "firstJobSource",
            "firstJobSourceOther", "firstJobLevel", "currentJobLevel",
            "initialMonthlyIncome", "curriculumRelevant",
            "usefulCompetencies", "usefulCompetencyOther"
          ]
        }
      ],
      "optionSets": {
        "yesNo": [
          { "value": "true", "label": "Yes" },
          { "value": "false", "label": "No" }
        ],
        "civilStatus": [
          { "value": "Single", "label": "Single" },
          { "value": "Married", "label": "Married" },
          { "value": "Separated/Divorced", "label": "Separated/Divorced" },
          { "value": "Solo Parent", "label": "Solo Parent" },
          { "value": "Widow or Widower", "label": "Widow or Widower" }
        ],
        "sex": [
          { "value": "Male", "label": "Male" },
          { "value": "Female", "label": "Female" }
        ],
        "employmentStatus": [
          { "value": "Yes", "label": "Yes" },
          { "value": "No", "label": "No" },
          { "value": "Never Employed", "label": "Never Employed" }
        ],
        "placeOfWork": [
          { "value": "Local", "label": "Local" },
          { "value": "Abroad", "label": "Abroad" }
        ],
        "jobDuration": [
          { "value": "Less than a month", "label": "Less than a month" },
          { "value": "1-6 months", "label": "1-6 months" },
          { "value": "7-11 months", "label": "7-11 months" },
          { "value": "1-2 years", "label": "1-2 years" },
          { "value": "2-3 years", "label": "2-3 years" },
          { "value": "3-4 years", "label": "3-4 years" },
          { "value": "Others", "label": "Others" }
        ],
        "jobLevel": [
          { "value": "Rank/Clerical", "label": "Rank/Clerical" },
          { "value": "Professional/Technical/Supervisory", "label": "Professional/Technical/Supervisory" },
          { "value": "Managerial/Executive", "label": "Managerial/Executive" },
          { "value": "Self-employed", "label": "Self-employed" }
        ],
        "monthlyIncome": [
          { "value": "Below 5000", "label": "Below 5000" },
          { "value": "5000-9999", "label": "5000-9999" },
          { "value": "10000-14999", "label": "10000-14999" },
          { "value": "15000-19999", "label": "15000-19999" },
          { "value": "20000-24999", "label": "20000-24999" },
          { "value": "25000 Above", "label": "25000 Above" }
        ],
        "competencies": [
          { "value": "Communication Skills", "label": "Communication Skills" },
          { "value": "Human Relation Skills", "label": "Human Relation Skills" },
          { "value": "Entrepreneurial Skills", "label": "Entrepreneurial Skills" },
          { "value": "Problem Solving Skills", "label": "Problem Solving Skills" },
          { "value": "Critical Thinking Skills", "label": "Critical Thinking Skills" },
          { "value": "Others", "label": "Others" }
        ]
      }
    }
    $definition$::JSONB,
    NOW()
FROM form_definitions
WHERE slug = 'graduate-tracer'
ON CONFLICT (form_id, version) DO NOTHING;
