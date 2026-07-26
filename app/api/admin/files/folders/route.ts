import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { requireAdminDirectoryItem } from "@/lib/google-drive/admin-files";
import { listIndexedFolderOptions } from "@/lib/repositories/google-drive-items.repository";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const excludeId = request.nextUrl.searchParams.get("exclude") || undefined;
    const referenceId = excludeId ?? request.nextUrl.searchParams.get("current");

    if (!referenceId) {
      return NextResponse.json(
        { success: false, message: "A current item is required." },
        { status: 400 },
      );
    }

    const { rootId, adminRootId } = await requireAdminDirectoryItem(referenceId);
    const folders = await listIndexedFolderOptions({
      rootId,
      ancestorId: adminRootId,
      excludeSubtreeId: excludeId,
    });

    return NextResponse.json({
      success: true,
      data: { folders, adminRootId },
    });
  } catch (error) {
    console.error("Failed to list Admin Files folders:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to list folders.",
      },
      { status: 500 },
    );
  }
}
