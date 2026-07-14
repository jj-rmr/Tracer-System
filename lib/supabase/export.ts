import { stringify } from "csv-stringify/sync";
import { getAllSurveys } from "../repositories/surveys.repository";

export async function exportSurveysCsv() {
  const surveys = await getAllSurveys();

  if (surveys.length === 0) {
    return "";
  }

  const rows = surveys.map((survey) => ({
    ...survey,
    createdAt: survey.createdAt
      ? new Date(survey.createdAt).toLocaleString("en-PH")
      : "",

    updatedAt: survey.updatedAt
      ? new Date(survey.updatedAt).toLocaleString("en-PH")
      : "",
  }));

  return stringify(rows, {
    header: true,
  });
}
