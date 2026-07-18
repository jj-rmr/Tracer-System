import { stringify } from "csv-stringify/sync";
import { getAllSurveys } from "@/lib/repositories/surveys.repository";

export async function exportSurveysCsv() {
  const surveys = await getAllSurveys();

  if (surveys.length === 0) {
    return "";
  }

  const rows = surveys.map((survey) => ({
    ...survey,
    createdAt: survey.createdAt
      ? new Date(survey.createdAt).toLocaleString("en-PH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "",

    updatedAt: survey.updatedAt
      ? new Date(survey.updatedAt).toLocaleString("en-PH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "",
  }));

  return stringify(rows, {
    header: true,
  });
}
