import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { organizeResponseDriveFolder } from "@/lib/google-drive/organize-response";
import { getFormResponseById } from "@/lib/repositories/form-responses.repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const response = await getFormResponseById(id);

    if (!response) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }

    await organizeResponseDriveFolder(response);
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
