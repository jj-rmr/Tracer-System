import { NextRequest, NextResponse } from "next/server";

import { canManageResponse, requireStaff } from "@/lib/auth";
import { organizeResponseDriveFolder } from "@/lib/google-drive/organize-response";
import { getFormResponseById } from "@/lib/repositories/form-responses.repository";
import { recordUserAuditEventSafely } from "@/lib/repositories/audit.repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const staff = await requireStaff();
    const { id } = await params;
    const response = await getFormResponseById(id);

    if (!response) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }
    if (!canManageResponse(staff, response)) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }

    await organizeResponseDriveFolder(response);
    await recordUserAuditEventSafely(staff, {
      action: "response.drive_organized",
      targetType: "form_response",
      targetId: id,
      metadata: { studyPeriodId: response.studyPeriodId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to organize response Drive folder:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to organize the response folder.",
      },
      { status: 502 },
    );
  }
}
