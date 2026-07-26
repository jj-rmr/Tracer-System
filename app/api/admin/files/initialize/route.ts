import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { initializeStudyDriveHierarchy } from "@/lib/google-drive/initialize-hierarchy";
import { syncGoogleDriveIndex } from "@/lib/google-drive/sync-index";
import { listStudyDriveContexts } from "@/lib/repositories/study-admin.repository";

export const maxDuration = 300;

export async function POST() {
  try {
    await requireAdmin();

    const studies = await listStudyDriveContexts();
    let foldersPrepared = 0;

    for (const study of studies) {
      const result = await initializeStudyDriveHierarchy(study);
      foldersPrepared += result.campuses + result.colleges + result.programs;
    }

    const sync = await syncGoogleDriveIndex();

    return NextResponse.json({
      success: true,
      data: { studies: studies.length, foldersPrepared, sync },
    });
  } catch (error) {
    console.error("Failed to initialize Google Drive folders:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to prepare the Drive folder structure.",
      },
      { status: 500 },
    );
  }
}
