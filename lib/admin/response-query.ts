import { PROGRAMS } from "@/lib/programs/catalog";
import { AdminResponseFilters, FormResponseSource, FormResponseStatus } from "@/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SOURCES = new Set<FormResponseSource>(["alumni", "admin_import"]);
const STATUSES = new Set<FormResponseStatus>(["draft", "submitted"]);
const PROGRAM_VALUES = new Set(PROGRAMS.map((program) => program.value));
const EMPLOYMENT_STATUSES = new Set(["Yes", "No", "Never Employed"]);

export class InvalidResponseQueryError extends Error {}

function optionalValue(searchParams: URLSearchParams, name: string) {
  return searchParams.get(name)?.trim() || undefined;
}

export function parseAdminResponseQuery(searchParams: URLSearchParams) {
  const rawPage = searchParams.get("page") ?? "1";
  const rawLimit = searchParams.get("limit") ?? "10";
  const page = Number(rawPage);
  const limit = Number(rawLimit);
  const search = optionalValue(searchParams, "search");
  const studyPeriodId = optionalValue(searchParams, "study");
  const program = optionalValue(searchParams, "program");
  const source = optionalValue(searchParams, "source");
  const status = optionalValue(searchParams, "status");
  const employmentStatus = optionalValue(searchParams, "employmentStatus");

  if (!Number.isInteger(page) || page < 1) {
    throw new InvalidResponseQueryError("Page must be a positive integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new InvalidResponseQueryError("Limit must be between 1 and 100.");
  }

  if (search && search.length > 100) {
    throw new InvalidResponseQueryError("Search must not exceed 100 characters.");
  }

  if (studyPeriodId && !UUID_PATTERN.test(studyPeriodId)) {
    throw new InvalidResponseQueryError("Invalid study filter.");
  }

  if (program && !PROGRAM_VALUES.has(program)) {
    throw new InvalidResponseQueryError("Invalid program filter.");
  }

  if (source && !SOURCES.has(source as FormResponseSource)) {
    throw new InvalidResponseQueryError("Invalid response source filter.");
  }

  if (status && !STATUSES.has(status as FormResponseStatus)) {
    throw new InvalidResponseQueryError("Invalid response status filter.");
  }

  if (employmentStatus && !EMPLOYMENT_STATUSES.has(employmentStatus)) {
    throw new InvalidResponseQueryError("Invalid employment status filter.");
  }

  const filters: AdminResponseFilters = {
    search,
    studyPeriodId,
    program,
    source: source as FormResponseSource | undefined,
    status: status as FormResponseStatus | undefined,
    employmentStatus,
  };

  return { page, limit, filters };
}
