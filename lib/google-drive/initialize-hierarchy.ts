import { PROGRAM_FOLDER_MAP, PROGRAMS } from "@/lib/programs/catalog";

import { getOrCreateManagedFolder } from "./folders";
import { getDriveRootId } from "./browser";

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown";
}

async function runWithConcurrency<T>(
  values: T[],
  worker: (value: T) => Promise<void>,
  concurrency = 5,
) {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < values.length) {
      const value = values[nextIndex++];
      await worker(value);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, runWorker),
  );
}

export async function initializeStudyDriveHierarchy({
  studyId,
  academicYear,
}: {
  studyId: string;
  academicYear: string;
}) {
  const rootId = getDriveRootId();
  const tracerRoot = await getOrCreateManagedFolder({
    folderKey: `drive-root:${rootId}`,
    name: "Tracer Study Responses",
    parentId: rootId,
  });
  await getOrCreateManagedFolder({
    folderKey: `drive-root:${rootId}:upload-staging`,
    name: ".Pending Uploads",
    parentId: tracerRoot.id,
  });
  const responseHierarchy = await initializeAcademicYearHierarchy({
    directoryKey: `drive-root:${rootId}`,
    hierarchyKey: `drive-root:${rootId}:study:${studyId}`,
    rootName: "Tracer Study Responses",
    rootId,
    academicYearFolderKey: `drive-root:${rootId}:study:${studyId}`,
    academicYear,
  });
  const adminHierarchy = await initializeAcademicYearHierarchy({
    ...(await getAdminHierarchyInput(academicYear, rootId)),
  });

  return {
    campuses: responseHierarchy.campuses + adminHierarchy.campuses,
    colleges: responseHierarchy.colleges + adminHierarchy.colleges,
    programs: responseHierarchy.programs + adminHierarchy.programs,
  };
}

export async function initializeAdminDriveHierarchy(academicYear: string) {
  return initializeAcademicYearHierarchy(
    await getAdminHierarchyInput(academicYear),
  );
}

export function getAdminFilesHierarchyKey(rootId = getDriveRootId()) {
  return `drive-root:${rootId}:admin-files`;
}

export async function getOrCreateAdminFilesRoot() {
  const rootId = getDriveRootId();

  return getOrCreateManagedFolder({
    folderKey: getAdminFilesHierarchyKey(rootId),
    name: "Admin Files",
    parentId: rootId,
  });
}

async function getAdminHierarchyInput(
  academicYear: string,
  rootId = getDriveRootId(),
) {
  return {
    directoryKey: getAdminFilesHierarchyKey(rootId),
    hierarchyKey: `${getAdminFilesHierarchyKey(rootId)}:academic-year:${academicYear}`,
    rootName: "Admin Files",
    rootId,
    academicYearFolderKey: `${getAdminFilesHierarchyKey(rootId)}:academic-year:${academicYear}`,
    academicYear,
  };
}

async function initializeAcademicYearHierarchy({
  directoryKey,
  hierarchyKey,
  rootName,
  rootId,
  academicYearFolderKey,
  academicYear,
}: {
  directoryKey: string;
  hierarchyKey: string;
  rootName: string;
  rootId: string;
  academicYearFolderKey: string;
  academicYear: string;
}) {
  const directoryRoot = await getOrCreateManagedFolder({
    folderKey: directoryKey,
    name: rootName,
    parentId: rootId,
  });
  const studyFolder = await getOrCreateManagedFolder({
    folderKey: academicYearFolderKey,
    name: academicYear,
    parentId: directoryRoot.id,
  });
  const campuses = [...new Set(Object.values(PROGRAM_FOLDER_MAP).map(({ campus }) => campus))];
  const campusFolders = new Map<string, string>();

  await runWithConcurrency(campuses, async (campus) => {
    const folder = await getOrCreateManagedFolder({
      folderKey: `${hierarchyKey}:campus:${keyPart(campus)}`,
      name: campus,
      parentId: studyFolder.id,
    });
    campusFolders.set(campus, folder.id);
  });

  const colleges = [
    ...new Map(
      Object.values(PROGRAM_FOLDER_MAP).map(({ campus, college }) => [
        `${campus}\u0000${college}`,
        { campus, college },
      ]),
    ).values(),
  ];
  const collegeFolders = new Map<string, string>();

  await runWithConcurrency(colleges, async ({ campus, college }) => {
    const folder = await getOrCreateManagedFolder({
      folderKey: `${hierarchyKey}:campus:${keyPart(campus)}:college:${keyPart(college)}`,
      name: college,
      parentId: campusFolders.get(campus)!,
    });
    collegeFolders.set(`${campus}\u0000${college}`, folder.id);
  });

  await runWithConcurrency(PROGRAMS, async (program) => {
    const organization = PROGRAM_FOLDER_MAP[program.value];

    if (!organization) return;

    await getOrCreateManagedFolder({
      folderKey: `${hierarchyKey}:program:${keyPart(program.value)}`,
      name: program.label,
      parentId: collegeFolders.get(
        `${organization.campus}\u0000${organization.college}`,
      )!,
    });
  });

  return {
    campuses: campuses.length,
    colleges: colleges.length,
    programs: PROGRAMS.length,
  };
}
