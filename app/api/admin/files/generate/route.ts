import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { initializeAdminDriveHierarchy } from "@/lib/google-drive/initialize-hierarchy";
import { syncGoogleDriveIndex } from "@/lib/google-drive/sync-index";

const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = (await request.json()) as Record<string, unknown>;
    const academicYear =
      typeof body.academicYear === "string" ? body.academicYear.trim() : "";
    const match = ACADEMIC_YEAR_PATTERN.exec(academicYear);

    if (!match || Number(match[2]) !== Number(match[1]) + 1) {
      return NextResponse.json(
        { success: false, message: "Enter an academic year such as 2026-2027." },
        { status: 400 },
      );
    }

    const generated = await initializeAdminDriveHierarchy(academicYear);
    const sync = await syncGoogleDriveIndex();

    return NextResponse.json({ success: true, data: { generated, sync } });
  } catch (error) {
    console.error("Failed to generate Admin Files folders:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to generate folders.",
      },
      { status: 500 },
    );
  }
}
