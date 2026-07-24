import { getStudyContext } from "@/lib/repositories/forms.repository";
import { PROGRAM_FOLDER_MAP, PROGRAMS } from "@/lib/programs/catalog";
import { FormResponse, SurveyDocument } from "@/types";

import { getOrCreateManagedFolder, getParentFolderId } from "./folders";

function answerText(response: FormResponse, key: string) {
  const value = response.answers[key];
  return typeof value === "string" ? value.trim() : "";
}

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown";
}

function getRespondentName(response: FormResponse) {
  const answerName = [
    answerText(response, "firstName"),
    answerText(response, "middleName"),
    answerText(response, "lastName"),
    answerText(response, "extensionName"),
  ]
    .filter(Boolean)
    .join(" ");

  return response.respondentName?.trim() || answerName || "Unnamed Respondent";
}

async function findExistingResponseFolder(documents: SurveyDocument[]) {
  const documentFolderId = documents[0]?.googleDriveFolderId;

  if (!documentFolderId) {
    return undefined;
  }

  return (await getParentFolderId(documentFolderId).catch(() => null)) ?? undefined;
}

export async function getResponseDocumentFolder({
  response,
  documents,
  documentType,
}: {
  response: FormResponse;
  documents: SurveyDocument[];
  documentType: "employment" | "awards";
}) {
  const configuredRootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!configuredRootId) {
    throw new Error("Missing required environment variable: GOOGLE_DRIVE_ROOT_FOLDER_ID");
  }

  const studyContext = await getStudyContext(response.studyPeriodId);

  if (!studyContext) {
    throw new Error("The response study period no longer exists.");
  }

  const programValue = answerText(response, "program");
  const programOption = PROGRAMS.find((program) => program.value === programValue);
  const programName =
    programOption?.label || programValue || "Program Not Specified";
  const programOrganization = PROGRAM_FOLDER_MAP[programValue];
  const campusName = programOrganization?.campus || "Campus Not Specified";
  const collegeName = programOrganization?.college || "College Not Specified";
  const hierarchyKey = `drive-root:${configuredRootId}`;

  const tracerRoot = await getOrCreateManagedFolder({
    folderKey: hierarchyKey,
    name: "Tracer Study Responses",
    parentId: configuredRootId,
  });
  const academicYearFolder = await getOrCreateManagedFolder({
    folderKey: `${hierarchyKey}:study:${response.studyPeriodId}`,
    name: studyContext.study.academicYear,
    parentId: tracerRoot.id,
  });
  const campusFolder = await getOrCreateManagedFolder({
    folderKey: `${hierarchyKey}:study:${response.studyPeriodId}:campus:${keyPart(campusName)}`,
    name: campusName,
    parentId: academicYearFolder.id,
  });
  const collegeFolder = await getOrCreateManagedFolder({
    folderKey: `${hierarchyKey}:study:${response.studyPeriodId}:campus:${keyPart(campusName)}:college:${keyPart(collegeName)}`,
    name: collegeName,
    parentId: campusFolder.id,
  });
  const programFolder = await getOrCreateManagedFolder({
    folderKey: `${hierarchyKey}:study:${response.studyPeriodId}:program:${keyPart(programValue)}`,
    name: programName,
    parentId: collegeFolder.id,
  });
  const existingResponseFolderId = await findExistingResponseFolder(documents);
  const responseFolder = await getOrCreateManagedFolder({
    folderKey: `${hierarchyKey}:response:${response.id}`,
    name: `${getRespondentName(response)} - ${response.id}`,
    parentId: programFolder.id,
    existingFolderId: existingResponseFolderId,
  });
  const existingTypeFolderId = documents.find(
    (document) => document.documentType === documentType,
  )?.googleDriveFolderId;

  return getOrCreateManagedFolder({
    folderKey: `${hierarchyKey}:response:${response.id}:documents:${documentType}`,
    name: documentType === "employment" ? "Employment Documents" : "Awards",
    parentId: responseFolder.id,
    existingFolderId: existingTypeFolderId,
  });
}
