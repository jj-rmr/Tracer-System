import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import {
  listIndexedFolder,
  searchIndexedDriveFolder,
} from "@/lib/google-drive/browser";
import { ensureGoogleDriveIndex } from "@/lib/google-drive/sync-index";
import { getAdminFilesHierarchyKey } from "@/lib/google-drive/initialize-hierarchy";
import { getDriveRootId } from "@/lib/google-drive/browser";
import { getRegisteredDriveFolder } from "@/lib/repositories/google-drive-folders.repository";
import { isIndexedDriveDescendant } from "@/lib/repositories/google-drive-items.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await ensureGoogleDriveIndex();

    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
    const folderId = request.nextUrl.searchParams.get("folder") || undefined;

    if (search) {
      const items = await searchIndexedDriveFolder({ folderId, query: search });
      return NextResponse.json({ success: true, data: { items, search } });
    }

    const pageToken =
      request.nextUrl.searchParams.get("pageToken") || undefined;
    const data = await listIndexedFolder({ folderId, pageToken });
    const adminRoot = await getRegisteredDriveFolder(
      getAdminFilesHierarchyKey(getDriveRootId()),
    );
    const uploadAllowed = adminRoot
      ? await isIndexedDriveDescendant(
          data.folderId,
          adminRoot.googleDriveFolderId,
        )
      : false;

    return NextResponse.json({
      success: true,
      data: { ...data, uploadAllowed },
    });
  } catch (error) {
    console.error("Failed to browse Google Drive:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to browse Google Drive.",
      },
      { status: 500 },
    );
  }
}
