import { Survey } from "@/types";
import { createFolder } from "./folders";
import { updateSurvey } from "@/lib/repositories/surveys.repository";

function getGraduateFolderName(survey: Survey) {
  const name = [
    survey.lastName,
    `${survey.firstName} ${survey.middleName}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  return `${name} - ${survey.id}`;
}

export async function getOrCreateGraduateFolder(
  survey: Survey,
): Promise<string> {
  if (survey.graduateFolderId) {
    return survey.graduateFolderId;
  }

  const folder = await createFolder(getGraduateFolderName(survey));

  if (!folder.id) {
    throw new Error("Failed to create graduate folder");
  }

  await updateSurvey(survey.id, {
    graduateFolderId: folder.id,
  });

  return folder.id;
}
