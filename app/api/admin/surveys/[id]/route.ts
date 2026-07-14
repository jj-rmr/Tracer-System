//api/surveys/[id]

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { requireRole } from "@/lib/auth/roles";

import {
  getSurveyById,
  updateSurvey,
  deleteSurvey,
} from "@/lib/repositories/surveys.repository";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { user } = await requireUser();

    requireRole(user, ["Admin"]);

    const { id } = await params;

    const survey = await getSurveyById(id);

    return NextResponse.json({
      success: true,
      survey: {
        ...survey,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 400,
      },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { user } = await requireUser();

    requireRole(user, ["Admin"]);

    const { id } = await params;

    const body = await request.json();

    await updateSurvey(id, body);

    const survey = await getSurveyById(id);

    return NextResponse.json({
      success: true,
      survey: {
        ...survey,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 400,
      },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { user } = await requireUser();

    requireRole(user, ["Admin"]);

    const { id } = await params;

    await deleteSurvey(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 400,
      },
    );
  }
}
