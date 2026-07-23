import { stringify } from "csv-stringify/sync";

import { listFormResponses } from "@/lib/repositories/form-responses.repository";

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

export async function exportResponsesCsv() {
  const responses = await listFormResponses();
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
