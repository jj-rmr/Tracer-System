import { supabase } from "@/lib/supabase/server";
import {
  AdminResponseFilters,
  AdminResponseSummary,
  FormResponseSource,
  FormResponseStatus,
  ManualImportStatus,
  ResponseDeletionStatus,
} from "@/types";

interface AdminResponseSummaryRow {
  id: string;
  study_period_id: string;
  academic_year: string;
  study_title: string;
  source: FormResponseSource;
  status: FormResponseStatus;
  respondent_name: string | null;
  respondent_email: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  extension_name: string | null;
  sex: string | null;
  civil_status: string | null;
  employment_status: string | null;
  program: string | null;
  submitted_at: string | null;
  created_at: string;
  import_status: ManualImportStatus;
  deletion_status: ResponseDeletionStatus;
}

const SUMMARY_COLUMNS = [
  "id",
  "study_period_id",
  "academic_year",
  "study_title",
  "source",
  "status",
  "respondent_name",
  "respondent_email",
  "first_name",
  "middle_name",
  "last_name",
  "extension_name",
  "sex",
  "civil_status",
  "employment_status",
  "program",
  "submitted_at",
  "created_at",
  "import_status",
  "deletion_status",
].join(",");

function mapSummary(row: AdminResponseSummaryRow): AdminResponseSummary {
  return {
    id: row.id,
    studyPeriodId: row.study_period_id,
    academicYear: row.academic_year,
    studyTitle: row.study_title,
    source: row.source,
    status: row.status,
    respondentName: row.respondent_name,
    respondentEmail: row.respondent_email,
    firstName: row.first_name ?? "",
    middleName: row.middle_name ?? "",
    lastName: row.last_name ?? "",
    extensionName: row.extension_name ?? "",
    sex: row.sex ?? "",
    civilStatus: row.civil_status ?? "",
    employmentStatus: row.employment_status ?? "",
    program: row.program ?? "",
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    importStatus: row.import_status,
    deletionStatus: row.deletion_status,
  };
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function applyFilters<T extends ReturnType<typeof createSummaryQuery>>(
  query: T,
  filters: AdminResponseFilters,
) {
  let filteredQuery = query;

  if (filters.search) {
    filteredQuery = filteredQuery.ilike(
      "search_text",
      `%${escapeLikePattern(filters.search.toLowerCase())}%`,
    ) as T;
  }

  if (filters.studyPeriodId) {
    filteredQuery = filteredQuery.eq(
      "study_period_id",
      filters.studyPeriodId,
    ) as T;
  }

  if (filters.program) {
    filteredQuery = filteredQuery.eq("program", filters.program) as T;
  }

  if (filters.source) {
    filteredQuery = filteredQuery.eq("source", filters.source) as T;
  }

  if (filters.status) {
    filteredQuery = filteredQuery.eq("status", filters.status) as T;
  }

  if (filters.employmentStatus) {
    filteredQuery = filteredQuery.eq(
      "employment_status",
      filters.employmentStatus,
    ) as T;
  }

  return filteredQuery;
}

function createSummaryQuery() {
  return supabase
    .from("admin_response_summaries")
    .select(SUMMARY_COLUMNS, { count: "exact" })
    .eq("import_status", "completed")
    .eq("deletion_status", "active");
}

export async function listAdminResponseSummaries({
  filters,
  page,
  limit,
}: {
  filters: AdminResponseFilters;
  page: number;
  limit: number;
}) {
  const from = (page - 1) * limit;
  const { data, error, count } = await applyFilters(
    createSummaryQuery(),
    filters,
  )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw error;

  return {
    responses: (data as unknown as AdminResponseSummaryRow[]).map(mapSummary),
    total: count ?? 0,
  };
}
