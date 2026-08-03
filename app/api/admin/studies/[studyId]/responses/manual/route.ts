import { after, NextRequest, NextResponse } from "next/server";

import { canAccessProgram, isCoordinator, requireStaff } from "@/lib/auth";
import { organizeResponseDriveFolder } from "@/lib/google-drive/organize-response";
import {
  createManualFormResponse,
  ManualImportConflictError,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";

interface ManualResponseBody {
  respondentName?: unknown;
  respondentEmail?: unknown;
  answers?: unknown;
  importToken?: unknown;
  mode?: unknown;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  try {
    const staff = await requireStaff();
    const { studyId } = await params;
    const context = await getStudyContext(studyId);

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as ManualResponseBody;
    const respondentName =
      typeof body.respondentName === "string" ? body.respondentName.trim() : "";
    const respondentEmail =
      typeof body.respondentEmail === "string"
        ? body.respondentEmail.trim()
        : undefined;
    const importToken =
      typeof body.importToken === "string" ? body.importToken : "";
    const mode = body.mode === "draft" ? "draft" : "submitted";

    if (!UUID_PATTERN.test(importToken)) {
      return NextResponse.json(
        { success: false, message: "A valid manual import token is required." },
        { status: 400 },
      );
    }

    if (context.study.status !== "open" && mode === "submitted") {
      return NextResponse.json(
        {
          success: false,
          message: "Open the study before adding manual responses.",
        },
        { status: 423 },
      );
    }

    if (!isObject(body.answers)) {
      return NextResponse.json(
        {
          success: false,
          message: "Answers must be a valid object.",
        },
        { status: 400 },
      );
    }

    const selectedProgram = body.answers.program;
    if (
      isCoordinator(staff) &&
      ((typeof selectedProgram === "string" && selectedProgram) ||
        mode === "submitted") &&
      !canAccessProgram(staff, selectedProgram)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected program is outside your assignments.",
        },
        { status: 403 },
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

    if (respondentName.length > 300 || (respondentEmail?.length ?? 0) > 254) {
      return NextResponse.json(
        { success: false, message: "Manual response identity is too long." },
        { status: 400 },
      );
    }

    const saved = await createManualFormResponse({
      studyPeriodId: studyId,
      enteredByUserId: staff.id,
      respondentName: respondentName || undefined,
      respondentEmail,
      answers: body.answers,
      importToken,
      status: mode,
    });

    if (mode === "submitted") {
      after(async () => {
        try {
          await organizeResponseDriveFolder(saved.response);
        } catch (error) {
          console.error("Failed to organize the manual response:", error);
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...saved.response,
          importToken: saved.importToken,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create manual response:", error);

    if (error instanceof ManualImportConflictError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This manual import session is no longer available. Start a new response.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create manual response.",
      },
      { status: 500 },
    );
  }
}
