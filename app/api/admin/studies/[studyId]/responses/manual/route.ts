import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { createManualFormResponse } from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";

interface ManualResponseBody {
  respondentName?: unknown;
  respondentEmail?: unknown;
  answers?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { studyId } = await params;
    const context = await getStudyContext(studyId);

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    if (context.study.status === "archived") {
      return NextResponse.json(
        {
          success: false,
          message: "Archived study periods cannot receive new responses.",
        },
        { status: 423 },
      );
    }

    const body = (await request.json()) as ManualResponseBody;
    const respondentName =
      typeof body.respondentName === "string"
        ? body.respondentName.trim()
        : "";
    const respondentEmail =
      typeof body.respondentEmail === "string"
        ? body.respondentEmail.trim()
        : undefined;
    if (!isObject(body.answers)) {
      return NextResponse.json(
        {
          success: false,
          message: "Answers must be a valid object.",
        },
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

    const response = await createManualFormResponse({
      studyPeriodId: studyId,
      enteredByUserId: admin.$id,
      respondentName: respondentName || undefined,
      respondentEmail,
      answers: body.answers,
    });

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create manual response:", error);

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
