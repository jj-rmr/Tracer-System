import { Survey } from "@/types";
import { createFolder } from "./folders";
import { drive } from "../google-drive";
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
    try {
      const folder = await drive.files.get({
        fileId: survey.graduateFolderId,
        fields: "id,mimeType,trashed",
      });

      if (
        folder.data.id &&
        folder.data.mimeType === "application/vnd.google-apps.folder" &&
        !folder.data.trashed
      ) {
        return folder.data.id;
      }
    } catch {
      // Stored folder no longer exists. A new one will be created below.
    }
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
