import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import { deleteResponseDriveData } from "@/lib/google-drive/response-cleanup";
import {
  claimFormResponseDeletion,
  deleteFormResponse,
  getFormResponseById,
  getFormResponseDeletionStatus,
  getFormResponseDocuments,
  markFormResponseDeletionFailed,
} from "@/lib/repositories/form-responses.repository";

interface ResponseRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: ResponseRouteProps) {
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

    const responseView = formResponseToSurvey(
      response,
      await getFormResponseDocuments(response.id),
    );
    return NextResponse.json({ success: true, response: responseView });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load response.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: ResponseRouteProps,
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const response = await claimFormResponseDeletion(id);

    if (!response) {
      const deletionStatus = await getFormResponseDeletionStatus(id);

      return NextResponse.json(
        {
          success: false,
          message: deletionStatus
            ? "This response is already being deleted."
            : "Response not found.",
        },
        { status: deletionStatus ? 409 : 404 },
      );
    }

    try {
      await deleteResponseDriveData(response.id);
      await deleteFormResponse(response.id);
    } catch (error) {
      await markFormResponseDeletionFailed(response.id).catch(() => undefined);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Failed to delete response:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "The response could not be fully deleted. It was retained for a safe retry.",
      },
      { status: 502 },
    );
  }
}
