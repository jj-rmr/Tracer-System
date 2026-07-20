import { Survey } from "@/types";
import { getOrCreateFolder } from "./folders";
import { drive } from "../google-drive";
import { updateSurvey } from "@/lib/repositories/surveys.repository";
import { PROGRAMS, PROGRAM_FOLDER_MAP } from "@/types/program";

const folderCreationLocks = new Map<string, Promise<string>>();

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
      // Stored folder no longer exists.
    }
  }

  const existingCreation = folderCreationLocks.get(survey.id);

  if (existingCreation) {
    return existingCreation;
  }

  const creationPromise = createGraduateFolderHierarchy(survey);

  folderCreationLocks.set(survey.id, creationPromise);

  try {
    return await creationPromise;
  } finally {
    folderCreationLocks.delete(survey.id);
  }
}

async function createGraduateFolderHierarchy(survey: Survey): Promise<string> {
  const folderInfo = PROGRAM_FOLDER_MAP[survey.program];

  if (!folderInfo) {
    throw new Error(`No folder mapping found for program: ${survey.program}`);
  }

  const program = PROGRAMS.find((program) => program.value === survey.program);

  if (!program) {
    throw new Error(`Program not found: ${survey.program}`);
  }

  const campusFolder = await getOrCreateFolder(folderInfo.campus);

  if (!campusFolder.id) {
    throw new Error("Failed to create or find campus folder");
  }

  const collegeFolder = await getOrCreateFolder(
    folderInfo.college,
    campusFolder.id,
  );

  if (!collegeFolder.id) {
    throw new Error("Failed to create or find college folder");
  }

  const programFolder = await getOrCreateFolder(
    program.label,
    collegeFolder.id,
  );

  if (!programFolder.id) {
    throw new Error("Failed to create or find program folder");
  }

  const graduateFolder = await getOrCreateFolder(
    getGraduateFolderName(survey),
    programFolder.id,
  );

  if (!graduateFolder.id) {
    throw new Error("Failed to create or find graduate folder");
  }

  await updateSurvey(survey.id, {
    graduateFolderId: graduateFolder.id,
  });

  return graduateFolder.id;
}
