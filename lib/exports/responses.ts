import { stringify } from "csv-stringify/sync";

import { listAdminResponseSummaries } from "@/lib/repositories/admin-responses.repository";
import { listFormResponsesByIds } from "@/lib/repositories/form-responses.repository";
import { AdminResponseFilters } from "@/types";

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString("en-PH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";
}

export async function exportResponsesCsv(filters: AdminResponseFilters = {}) {
  const responseIds: string[] = [];
  const limit = 100;
  let page = 1;
  let total = 0;

  do {
    const result = await listAdminResponseSummaries({ filters, page, limit });
    responseIds.push(...result.responses.map((response) => response.id));
    total = result.total;
    page += 1;
  } while (responseIds.length < total);

  const responses = await listFormResponsesByIds(responseIds);
  if (responses.length === 0) return "";

  return stringify(
    responses.map((response) => ({
      responseId: response.id,
      studyPeriodId: response.studyPeriodId,
      source: response.source,
      status: response.status,
      respondentName: response.respondentName ?? "",
      respondentEmail: response.respondentEmail ?? "",
      userId: response.userId ?? "",
      submittedAt: formatDate(response.submittedAt),
      createdAt: formatDate(response.createdAt),
      updatedAt: formatDate(response.updatedAt),
      ...response.answers,
    })),
    { header: true },
  );
}
