import { supabase } from "@/lib/supabase/server";
import { Survey } from "@/types";
import { getSurveyDocuments } from "./survey-documents.repository";

function toDb(survey: Partial<Survey>) {
  const userId = survey.userId && survey.userId.trim() ? survey.userId : null;

  return {
    user_id: userId,

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

    program: survey.program || null,
    year_graduated:
      survey.yearGraduated != null ? Number(survey.yearGraduated) : null,

    honors: survey.honors ?? [],
    trainings: survey.trainings ?? [],

    advanced_study_degree: survey.advancedStudyDegree || null,

    advanced_study_other: survey.advancedStudyOther || null,

    advanced_study_reasons: survey.advancedStudyReasons || null,

    advanced_study_reason_other: survey.advancedStudyReasonOther || null,

    employment_status: survey.employmentStatus || null,

    unemployment_reasons: survey.unemploymentReasons ?? [],

    unemployment_reason_other: survey.unemploymentReasonOther || null,

    current_employment_status: survey.currentEmploymentStatus || null,

    current_occupation: survey.currentOccupation || null,

    company_name: survey.companyName || null,

    company_address: survey.companyAddress || null,

    business_industry: survey.businessIndustry || null,

    place_of_work: survey.placeOfWork || null,

    graduate_folder_id: survey.graduateFolderId || null,
    document_type: survey.documents?.length ? "upload" : "survey",

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

function toDbPatch(survey: Partial<Survey>) {
  const payload: Record<string, unknown> = {};

  if (survey.userId !== undefined) {
    payload.user_id = survey.userId?.trim() || null;
  }

  if (survey.firstName !== undefined) {
    payload.first_name = survey.firstName || null;
  }

  if (survey.middleName !== undefined) {
    payload.middle_name = survey.middleName || null;
  }

  if (survey.lastName !== undefined) {
    payload.last_name = survey.lastName || null;
  }

  if (survey.extensionName !== undefined) {
    payload.extension_name = survey.extensionName || null;
  }

  if (survey.street !== undefined) {
    payload.street = survey.street || null;
  }

  if (survey.barangay !== undefined) {
    payload.barangay = survey.barangay || null;
  }

  if (survey.municipality !== undefined) {
    payload.municipality = survey.municipality || null;
  }

  if (survey.province !== undefined) {
    payload.province = survey.province || null;
  }

  if (survey.region !== undefined) {
    payload.region = survey.region || null;
  }

  if (survey.contactNumbers !== undefined) {
    payload.contact_numbers = survey.contactNumbers ?? [];
  }

  if (survey.civilStatus !== undefined) {
    payload.civil_status = survey.civilStatus || null;
  }

  if (survey.sex !== undefined) {
    payload.sex = survey.sex || null;
  }

  if (survey.program !== undefined) {
    payload.program = survey.program || null;
  }

  if (survey.yearGraduated !== undefined) {
    payload.year_graduated =
      survey.yearGraduated != null ? Number(survey.yearGraduated) : null;
  }

  if (survey.honors !== undefined) {
    payload.honors = survey.honors ?? [];
  }

  if (survey.trainings !== undefined) {
    payload.trainings = survey.trainings ?? [];
  }

  if (survey.advancedStudyDegree !== undefined) {
    payload.advanced_study_degree = survey.advancedStudyDegree || null;
  }

  if (survey.advancedStudyOther !== undefined) {
    payload.advanced_study_other = survey.advancedStudyOther || null;
  }

  if (survey.advancedStudyReasons !== undefined) {
    payload.advanced_study_reasons = survey.advancedStudyReasons || null;
  }

  if (survey.advancedStudyReasonOther !== undefined) {
    payload.advanced_study_reason_other =
      survey.advancedStudyReasonOther || null;
  }

  if (survey.employmentStatus !== undefined) {
    payload.employment_status = survey.employmentStatus || null;
  }

  if (survey.unemploymentReasons !== undefined) {
    payload.unemployment_reasons = survey.unemploymentReasons ?? [];
  }

  if (survey.unemploymentReasonOther !== undefined) {
    payload.unemployment_reason_other = survey.unemploymentReasonOther || null;
  }

  if (survey.currentEmploymentStatus !== undefined) {
    payload.current_employment_status = survey.currentEmploymentStatus || null;
  }

  if (survey.currentOccupation !== undefined) {
    payload.current_occupation = survey.currentOccupation || null;
  }

  if (survey.companyName !== undefined) {
    payload.company_name = survey.companyName || null;
  }

  if (survey.companyAddress !== undefined) {
    payload.company_address = survey.companyAddress || null;
  }

  if (survey.businessIndustry !== undefined) {
    payload.business_industry = survey.businessIndustry || null;
  }

  if (survey.placeOfWork !== undefined) {
    payload.place_of_work = survey.placeOfWork || null;
  }

  if (survey.graduateFolderId !== undefined) {
    payload.graduate_folder_id = survey.graduateFolderId || null;
  }

  if (survey.documents !== undefined) {
    payload.document_type = survey.documents?.length ? "upload" : "survey";
  }

  if (survey.isFirstJob !== undefined) {
    payload.is_first_job = survey.isFirstJob ?? false;
  }

  if (survey.isFirstJobRelated !== undefined) {
    payload.is_first_job_related = survey.isFirstJobRelated ?? false;
  }

  if (survey.stayingReasons !== undefined) {
    payload.staying_reasons = survey.stayingReasons ?? [];
  }

  if (survey.stayingReasonOther !== undefined) {
    payload.staying_reason_other = survey.stayingReasonOther || null;
  }

  if (survey.acceptingReasons !== undefined) {
    payload.accepting_reasons = survey.acceptingReasons ?? [];
  }

  if (survey.acceptingReasonOther !== undefined) {
    payload.accepting_reason_other = survey.acceptingReasonOther || null;
  }

  if (survey.changingReasons !== undefined) {
    payload.changing_reasons = survey.changingReasons ?? [];
  }

  if (survey.changingReasonOther !== undefined) {
    payload.changing_reason_other = survey.changingReasonOther || null;
  }

  if (survey.firstJobDuration !== undefined) {
    payload.first_job_duration = survey.firstJobDuration || null;
  }

  if (survey.firstJobDurationOther !== undefined) {
    payload.first_job_duration_other = survey.firstJobDurationOther || null;
  }

  if (survey.firstJobSource !== undefined) {
    payload.first_job_source = survey.firstJobSource || null;
  }

  if (survey.firstJobSourceOther !== undefined) {
    payload.first_job_source_other = survey.firstJobSourceOther || null;
  }

  if (survey.firstJobSearchDuration !== undefined) {
    payload.first_job_search_duration = survey.firstJobSearchDuration || null;
  }

  if (survey.firstJobSearchDurationOther !== undefined) {
    payload.first_job_search_duration_other =
      survey.firstJobSearchDurationOther || null;
  }

  if (survey.firstJobTitle !== undefined) {
    payload.first_job_title = survey.firstJobTitle || null;
  }

  if (survey.firstJobLevel !== undefined) {
    payload.first_job_level = survey.firstJobLevel || null;
  }

  if (survey.currentJobLevel !== undefined) {
    payload.current_job_level = survey.currentJobLevel || null;
  }

  if (survey.initialMonthlyIncome !== undefined) {
    payload.initial_monthly_income = survey.initialMonthlyIncome || null;
  }

  if (survey.curriculumRelevant !== undefined) {
    payload.curriculum_relevant = survey.curriculumRelevant ?? false;
  }

  if (survey.usefulCompetencies !== undefined) {
    payload.useful_competencies = survey.usefulCompetencies ?? [];
  }

  if (survey.usefulCompetencyOther !== undefined) {
    payload.useful_competency_other = survey.usefulCompetencyOther || null;
  }

  return payload;
}

function fromDb(row: any): Survey {
  return {
    id: row.id,
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

    program: row.program,
    yearGraduated: row.year_graduated,

    honors: row.honors ?? [],
    trainings: row.trainings ?? [],

    advancedStudyDegree: row.advanced_study_degree ?? "",
    advancedStudyOther: row.advanced_study_other ?? "",

    advancedStudyReasons: row.advanced_study_reasons ?? "",
    advancedStudyReasonOther: row.advanced_study_reason_other ?? "",

    employmentStatus: row.employment_status ?? "",
    unemploymentReasons: row.unemployment_reasons,
    unemploymentReasonOther: row.unemployment_reason_other ?? "",

    currentEmploymentStatus: row.current_employment_status ?? "",
    currentOccupation: row.current_occupation ?? "",

    companyName: row.company_name ?? "",
    companyAddress: row.company_address ?? "",

    businessIndustry: row.business_industry ?? "",
    placeOfWork: row.place_of_work ?? "",

    graduateFolderId: row.graduate_folder_id ?? "",

    isFirstJob: row.is_first_job,
    isFirstJobRelated: row.is_first_job_related,

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

    curriculumRelevant: row.curriculum_relevant,

    usefulCompetencies: row.useful_competencies ?? [],
    usefulCompetencyOther: row.useful_competency_other ?? "",
    documents: [],
  };
}

function transformSurvey(survey: Partial<Survey>): Partial<Survey> {
  return {
    ...survey,

    firstName: survey.firstName?.trim() ?? "",
    middleName: survey.middleName?.trim() ?? "",
    lastName: survey.lastName?.trim() ?? "",
    extensionName: survey.extensionName?.trim() ?? "",

    street: survey.street?.trim() ?? "",
    barangay: survey.barangay?.trim() ?? "",
    municipality: survey.municipality?.trim() ?? "",
    province: survey.province?.trim() ?? "",
    region: survey.region?.trim() ?? "",

    companyName: survey.companyName?.trim() ?? "",
    companyAddress: survey.companyAddress?.trim() ?? "",
    currentOccupation: survey.currentOccupation?.trim() ?? "",

    advancedStudyOther: survey.advancedStudyOther?.trim() ?? "",
    advancedStudyReasonOther: survey.advancedStudyReasonOther?.trim() ?? "",

    unemploymentReasonOther: survey.unemploymentReasonOther?.trim() ?? "",

    stayingReasonOther: survey.stayingReasonOther?.trim() ?? "",
    acceptingReasonOther: survey.acceptingReasonOther?.trim() ?? "",
    changingReasonOther: survey.changingReasonOther?.trim() ?? "",

    firstJobTitle: survey.firstJobTitle?.trim() ?? "",
    firstJobDurationOther: survey.firstJobDurationOther?.trim() ?? "",
    firstJobSourceOther: survey.firstJobSourceOther?.trim() ?? "",
    firstJobSearchDurationOther:
      survey.firstJobSearchDurationOther?.trim() ?? "",

    usefulCompetencyOther: survey.usefulCompetencyOther?.trim() ?? "",

    contactNumbers: survey.contactNumbers?.map((n) => n.trim()).filter(Boolean),

    honors: survey.honors?.map((h) => h.trim()).filter(Boolean),

    trainings: survey.trainings?.map((t) => t.trim()).filter(Boolean),

    unemploymentReasons: survey.unemploymentReasons?.filter(Boolean),

    stayingReasons: survey.stayingReasons?.filter(Boolean),

    acceptingReasons: survey.acceptingReasons?.filter(Boolean),

    changingReasons: survey.changingReasons?.filter(Boolean),

    usefulCompetencies: survey.usefulCompetencies?.filter(Boolean),

    yearGraduated:
      survey.yearGraduated != null ? Number(survey.yearGraduated) : undefined,
  };
}

export async function createSurvey(survey: Survey) {
  const transformed = transformSurvey(survey);
  const payload = toDb(transformed);

  if (!payload.user_id || !String(payload.user_id).trim()) {
    throw new Error("Cannot create survey without a user_id");
  }

  console.log("Creating survey with payload:", payload);
  console.log("BEFORE INSERT");
  const { data: existingSurvey, error: existingError } = await supabase
    .from("surveys")
    .select("id")
    .eq("user_id", payload.user_id)
    .maybeSingle();
  console.log("AFTER INSERT");
  if (existingError) throw existingError;

  let data;
  let error;

  if (existingSurvey?.id) {
    ({ data, error } = await supabase
      .from("surveys")
      .update(payload)
      .eq("id", existingSurvey.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from("surveys")
      .insert(payload)
      .select()
      .single());
  }

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

  console.log("RAW SUPABASE FIRST NAME:", data.first_name);

  const survey = fromDb(data);

  console.log("MAPPED SURVEY FIRST NAME:", survey.firstName);

  const documents = await getSurveyDocuments(id);

  return {
    ...survey,
    documents,
  };
}

export async function getSurveyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return null;
  }

  const survey = fromDb(data);

  const documents = await getSurveyDocuments(survey.id);

  return {
    ...survey,
    documents,
  };
}

export async function getAllSurveys() {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(fromDb);
}

// export async function updateSurvey(id: string, survey: Partial<Survey>) {
//   const transformed = transformSurvey(survey);

//   const { data, error } = await supabase
//     .from("surveys")
//     .update(toDb(transformed))
//     .eq("id", id)
//     .select()
//     .single();

//   if (error) throw error;

//   return fromDb(data);
// }

export async function updateSurvey(id: string, survey: Partial<Survey>) {
  const transformed = transformSurvey(survey);
  const payload = toDbPatch(transformed);

  const { data, error } = await supabase
    .from("surveys")
    .update(payload)
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
