export interface SurveyRow {
  id: string;

  user_id: string;

  first_name: string;
  middle_name: string;
  last_name: string;
  extension_name: string;

  street: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;

  contact_numbers: string[];

  civil_status: string;
  sex: string;

  year_graduated: number | null;

  honors: string[];
  trainings: string[];

  advance_study_degree: string;
  advance_study_other: string;

  advance_study_reasons: string[];
  advance_study_reason_other: string;

  created_at: string;
  updated_at: string;
}
