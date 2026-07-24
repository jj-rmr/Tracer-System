import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireUser } from "@/lib/auth";
import {
  getFormResponse,
  saveFormResponse,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import { validateGraduateTracerSurvey } from "@/lib/forms/graduate-tracer-validation";
import { FormResponseStatus, ROLES } from "@/types";

interface SaveResponseBody {
  answers?: unknown;
  status?: unknown;
}

function isAnswersObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isResponseStatus(value: unknown): value is FormResponseStatus {
  return value === "draft" || value === "submitted";
}

function getUnknownAnswerKeys(
  answers: Record<string, unknown>,
  allowedKeys: string[],
) {
  const allowed = new Set(allowedKeys);

  return Object.keys(answers).filter((key) => !allowed.has(key));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  try {
    const { user } = await requireUser();
    requireRole(user, [ROLES.ALUMNI]);

    const { studyId } = await params;
    const context = await getStudyContext(studyId);

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    const response = await getFormResponse(studyId, user.$id);

    return NextResponse.json({
      success: true,
      data: {
        ...context,
        response,
        readOnly: context.study.status !== "open",
      },
    });
  } catch (error) {
    console.error("Failed to load study response:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load the study response." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  try {
    const { user } = await requireUser();
    requireRole(user, [ROLES.ALUMNI]);

    const { studyId } = await params;
    const context = await getStudyContext(studyId);

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    if (context.study.status !== "open") {
      return NextResponse.json(
        {
          success: false,
          message: "This study is closed and responses are read-only.",
        },
        { status: 423 },
      );
    }

    const body = (await request.json()) as SaveResponseBody;

    if (!isAnswersObject(body.answers) || !isResponseStatus(body.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid answers object and response status are required.",
        },
        { status: 400 },
      );
    }

    const allowedKeys = context.definition.sections.flatMap(
      (section) => section.fieldKeys,
    );
    const unknownKeys = getUnknownAnswerKeys(body.answers, allowedKeys);

    if (unknownKeys.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The response contains fields outside this form version.",
          errors: {
            unknownKeys,
          },
        },
        { status: 400 },
      );
    }

    if (body.status === "submitted") {
      const validation = validateGraduateTracerSurvey(body.answers);

      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            message: "Please complete all required survey fields.",
            errors: validation.errors,
          },
          { status: 400 },
        );
      }
    }

    const response = await saveFormResponse({
      studyPeriodId: studyId,
      userId: user.$id,
      status: body.status,
      answers: body.answers,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Failed to save study response:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save the study response." },
      { status: 500 },
    );
  }
}
