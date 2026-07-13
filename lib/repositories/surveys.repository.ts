import { supabase } from "@/lib/supabase/server";
import { Survey } from "@/types";

function toDb(survey: Partial<Survey>) {
  return {
    $id: survey.$id,
    user_id: survey.userId,

    created_at: survey.createdAt,
    updated_at: survey.updatedAt,

    first_name: survey.firstName || null,
    middle_name: survey.middleName || null,
    last_name: survey.lastName || null,
    extension_name: survey.extensionName || null,

    street: survey.street || null,
    barangay: survey.barangay || null,
    municipality: survey.municipality || null,
    province: survey.province || null,
    region: survey.region || null,

    contact_numbers: survey.contactNumbers ?? [],

    civil_status: survey.civilStatus || null,
    sex: survey.sex || null,

    year_graduated: survey.yearGraduated ? Number(survey.yearGraduated) : null,

    honors: survey.honors ?? [],
    trainings: survey.trainings ?? [],

    advance_study_degree: survey.advanceStudyDegree || null,

    advance_study_other: survey.advanceStudyOther || null,

    advance_study_reasons: survey.advanceStudyReasons || null,

    advance_study_reason_other: survey.advanceStudyReasonOther || null,

    employment_status: survey.employmentStatus || null,

    unemployment_reasons: survey.unemploymentReasons ?? [],

    unemployment_reason_other: survey.unemploymentReasonOther || null,

    present_employment_status: survey.presentEmploymentStatus || null,

    present_occupation: survey.presentOccupation || null,

    company_name: survey.companyName || null,

    company_address: survey.companyAddress || null,

    business_industry: survey.businessIndustry || null,

    place_of_work: survey.placeOfWork || null,

    employment_documents: survey.employmentDocuments ?? [],

    award_documents: survey.awardDocuments ?? [],

    is_first_job: survey.isFirstJob ?? false,

    is_first_job_related: survey.isFirstJobRelated ?? false,

    staying_reasons: survey.stayingReasons ?? [],

    staying_reason_other: survey.stayingReasonOther || null,

    accepting_reasons: survey.acceptingReasons ?? [],

    accepting_reason_other: survey.acceptingReasonOther || null,

    changing_reasons: survey.changingReasons ?? [],

    changing_reason_other: survey.changingReasonOther || null,

    first_job_duration: survey.firstJobDuration || null,

    first_job_duration_other: survey.firstJobDurationOther || null,

    first_job_source: survey.firstJobSource || null,

    first_job_source_other: survey.firstJobSourceOther || null,

    first_job_search_duration: survey.firstJobSearchDuration || null,

    first_job_search_duration_other: survey.firstJobSearchDurationOther || null,

    first_job_title: survey.firstJobTitle || null,

    first_job_level: survey.firstJobLevel || null,

    current_job_level: survey.currentJobLevel || null,

    initial_monthly_income: survey.initialMonthlyIncome || null,

    curriculum_relevant: survey.curriculumRelevant ?? false,

    useful_competencies: survey.usefulCompetencies ?? [],

    useful_competency_other: survey.usefulCompetencyOther || null,
  };
}

function fromDb(row: any): Survey {
  return {
    $id: row.id,
    userId: row.user_id,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    firstName: row.first_name ?? "",
    middleName: row.middle_name ?? "",
    lastName: row.last_name ?? "",
    extensionName: row.extension_name ?? "",

    street: row.street ?? "",
    barangay: row.barangay ?? "",
    municipality: row.municipality ?? "",
    province: row.province ?? "",
    region: row.region ?? "",

    contactNumbers: row.contact_numbers ?? [],

    civilStatus: row.civil_status ?? "Single",
    sex: row.sex ?? "",

    yearGraduated: row.year_graduated,

    honors: row.honors ?? [],
    trainings: row.trainings ?? [],

    advanceStudyDegree: row.advance_study_degree ?? "",
    advanceStudyOther: row.advance_study_other ?? "",
    advanceStudyReasons: row.advance_study_reasons ?? "",
    advanceStudyReasonOther: row.advance_study_reason_other ?? "",

    employmentStatus: row.employment_status ?? "",
    unemploymentReasons: row.unemployment_reasons ?? [],
    unemploymentReasonOther: row.unemployment_reason_other ?? "",

    presentEmploymentStatus: row.present_employment_status ?? "",
    presentOccupation: row.present_occupation ?? "",

    companyName: row.company_name ?? "",
    companyAddress: row.company_address ?? "",

    businessIndustry: row.business_industry ?? "",
    placeOfWork: row.place_of_work ?? "",

    employmentDocuments: row.employment_documents ?? [],
    awardDocuments: row.award_documents ?? [],

    isFirstJob: row.is_first_job ?? false,
    isFirstJobRelated: row.is_first_job_related ?? false,

    stayingReasons: row.staying_reasons ?? [],
    stayingReasonOther: row.staying_reason_other ?? "",

    acceptingReasons: row.accepting_reasons ?? [],
    acceptingReasonOther: row.accepting_reason_other ?? "",

    changingReasons: row.changing_reasons ?? [],
    changingReasonOther: row.changing_reason_other ?? "",

    firstJobDuration: row.first_job_duration ?? "",
    firstJobDurationOther: row.first_job_duration_other ?? "",

    firstJobSource: row.first_job_source ?? "",
    firstJobSourceOther: row.first_job_source_other ?? "",

    firstJobSearchDuration: row.first_job_search_duration ?? "",
    firstJobSearchDurationOther: row.first_job_search_duration_other ?? "",

    firstJobTitle: row.first_job_title ?? "",
    firstJobLevel: row.first_job_level ?? "",
    currentJobLevel: row.current_job_level ?? "",

    initialMonthlyIncome: row.initial_monthly_income ?? "",

    curriculumRelevant: row.curriculum_relevant ?? false,

    usefulCompetencies: row.useful_competencies ?? [],
    usefulCompetencyOther: row.useful_competency_other ?? "",
  };
}

export async function createSurvey(survey: Survey) {
  const { data, error } = await supabase
    .from("surveys")
    .insert(toDb(survey))
    .select()
    .single();

  if (error) throw error;

  return fromDb(data);
}

export async function getSurveyById(id: string) {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return fromDb(data);
}

export async function getSurveyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data ? fromDb(data) : null;
}

export async function updateSurvey(id: string, survey: Partial<Survey>) {
  const { data, error } = await supabase
    .from("surveys")
    .update(toDb(survey))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return fromDb(data);
}

export async function deleteSurvey(id: string) {
  const { error } = await supabase.from("surveys").delete().eq("id", id);

  if (error) throw error;
}

export async function listSurveys(page: number, limit: number, search: string) {
  let query = supabase.from("surveys").select("*", { count: "exact" });

  if (search.trim()) {
    query = query.or(
      [
        `first_name.ilike.%${search}%`,
        `middle_name.ilike.%${search}%`,
        `last_name.ilike.%${search}%`,
      ].join(","),
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    documents: (data ?? []).map(fromDb),
    total: count ?? 0,
  };
}

// export async function getSurveyById(id: string) {
//   const { data, error } = await supabase
//     .from("surveys")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) throw error;

//   return data;
// }

// export async function getSurveyByUserId(userId: string) {
//   const { data, error } = await supabase
//     .from("surveys")
//     .select("*")
//     .eq("user_id", userId)
//     .maybeSingle();

//   if (error) throw error;

//   return data;
// }

// export async function updateSurvey(id: string, survey: Partial<Survey>) {
//   const { data, error } = await supabase
//     .from("surveys")
//     .update(toDb(survey))
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) throw error;

//   return data;
// }

// export async function deleteSurvey(id: string) {
//   const { error } = await supabase.from("surveys").delete().eq("id", id);

//   if (error) throw error;
// }

// export async function listSurveys(page: number, limit: number, search: string) {
//   let query = supabase.from("surveys").select("*", { count: "exact" });

//   if (search.trim()) {
//     query = query.or(
//       [
//         `first_name.ilike.%${search}%`,
//         `middle_name.ilike.%${search}%`,
//         `last_name.ilike.%${search}%`,
//       ].join(","),
//     );
//   }

//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const { data, count, error } = await query
//     .order("created_at", { ascending: false })
//     .range(from, to);

//   if (error) throw error;

//   return {
//     documents: data ?? [],
//     total: count ?? 0,
//   };
// }
