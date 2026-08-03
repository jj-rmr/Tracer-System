import { after, NextRequest, NextResponse } from "next/server";

import {
  canAccessProgram,
  canManageManualResponse,
  canManageResponse,
  isCoordinator,
  requireStaff,
} from "@/lib/auth";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import { deleteResponseDriveData } from "@/lib/google-drive/response-cleanup";
import { organizeResponseDriveFolder } from "@/lib/google-drive/organize-response";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import {
  claimFormResponseDeletion,
  deleteFormResponse,
  getFormResponseById,
  getFormResponseForDeletion,
  getFormResponseDeletionStatus,
  getFormResponseDocuments,
  markFormResponseDeletionFailed,
  updateManualFormResponse,
} from "@/lib/repositories/form-responses.repository";

interface ResponseRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: ResponseRouteProps,
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

    const [documents, context] = await Promise.all([
      getFormResponseDocuments(response.id),
      getStudyContext(response.studyPeriodId),
    ]);
    const responseView = formResponseToSurvey(response, documents);
    return NextResponse.json({
      success: true,
      response: responseView,
      metadata: {
        source: response.source,
        respondentEmail: response.respondentEmail ?? "",
        studyStatus: context?.study.status ?? "closed",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load response.",
      },
      { status: 400 },
    );
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(
  request: NextRequest,
  { params }: ResponseRouteProps,
) {
  try {
    const staff = await requireStaff();
    const { id } = await params;
    const existing = await getFormResponseById(id);

    if (!existing || !canManageManualResponse(staff, existing)) {
      return NextResponse.json(
        { success: false, message: "Manual response not found." },
        { status: 404 },
      );
    }

    const context = await getStudyContext(existing.studyPeriodId);
    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      respondentName?: unknown;
      respondentEmail?: unknown;
      answers?: unknown;
    };
    if (!isObject(body.answers)) {
      return NextResponse.json(
        { success: false, message: "Answers must be a valid object." },
        { status: 400 },
      );
    }
    if (
      isCoordinator(staff) &&
      !canAccessProgram(staff, body.answers.program)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected program is outside your assignments.",
        },
        { status: 403 },
      );
    }

    const respondentName =
      typeof body.respondentName === "string" ? body.respondentName.trim() : "";
    const respondentEmail =
      typeof body.respondentEmail === "string"
        ? body.respondentEmail.trim()
        : "";
    if (respondentName.length > 300 || respondentEmail.length > 254) {
      return NextResponse.json(
        { success: false, message: "Manual response identity is too long." },
        { status: 400 },
      );
    }

    const allowedKeys = new Set(
      context.definition.sections.flatMap((section) => section.fieldKeys),
    );
    const unknownKeys = Object.keys(body.answers).filter(
      (key) => !allowedKeys.has(key),
    );
    if (unknownKeys.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The response contains fields outside this form version.",
          errors: { unknownKeys },
        },
        { status: 400 },
      );
    }

    const updated = await updateManualFormResponse({
      responseId: id,
      respondentName: respondentName || undefined,
      respondentEmail: respondentEmail || undefined,
      answers: body.answers,
    });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Manual response not found." },
        { status: 404 },
      );
    }

    after(async () => {
      try {
        await organizeResponseDriveFolder(updated);
      } catch (error) {
        console.error("Failed to reorganize the manual response:", error);
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to edit manual response:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to edit response.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: ResponseRouteProps,
) {
  try {
    const staff = await requireStaff();
    const { id } = await params;
    const existingResponse = await getFormResponseForDeletion(id);

    if (!existingResponse) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }
    if (!canManageResponse(staff, existingResponse)) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }

    let response =
      existingResponse.deletionStatus === "deleting"
        ? existingResponse
        : await claimFormResponseDeletion(id);

    for (let attempt = 0; !response && attempt < 20; attempt += 1) {
      const activeResponse = await getFormResponseForDeletion(id);
      if (
        !activeResponse ||
        activeResponse.driveOrganizationStatus !== "organizing"
      ) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      response = await claimFormResponseDeletion(id);
    }

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
