import { NextRequest, NextResponse } from "next/server";
import {
  createSurvey,
  getSurveyByUserId,
  updateSurvey,
} from "@/lib/repositories/surveys.repository";
import { requireUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/types";

export async function GET() {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const survey = await getSurveyByUserId(user.$id);
    console.log("SURVEY WITH DOCUMENTS:", survey);
    return NextResponse.json({
      success: true,
      survey,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message ?? "Failed to load survey.",
      },
      {
        status: 400,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const body = await request.json();

    const existing = await getSurveyByUserId(user.$id);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const { id, ...surveyData } = body;

    const survey = await createSurvey({
      ...surveyData,
      userId: user.$id,
    });

    return NextResponse.json({
      success: true,
      survey,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message ?? "Failed to create survey.",
      },
      {
        status: 400,
      },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const body = await request.json();

    const existing = await getSurveyByUserId(user.$id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey not found.",
        },
        {
          status: 404,
        },
      );
    }

    const survey = await updateSurvey(existing.id, body);

    return NextResponse.json({
      success: true,
      survey,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      { status: 400 },
    );
  }
}
