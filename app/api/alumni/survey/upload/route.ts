import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireUser } from "@/lib/auth";
import { ROLES } from "@/types";

import {
  createSurvey,
  getSurveyByUserId,
} from "@/lib/repositories/surveys.repository";
import { createSurveyDocument } from "@/lib/repositories/survey-documents.repository";

import { uploadSurveyDocument } from "@/lib/google/google-drive/upload-survey-document";
import { createMockSurvey } from "@/lib/survey/defaults";

export async function POST(request: NextRequest) {
  console.log("UPLOAD ROUTE HIT");

  try {
    const { user } = await requireUser();

    console.log("USER:", user.$id);

    requireRole(user, [ROLES.ALUMNI]);

    let survey = await getSurveyByUserId(user.$id);

    if (!survey) {
      console.log("Creating fallback survey for upload user", user.$id);

      const mockSurvey = createMockSurvey(user.$id);

      console.log("MOCK SURVEY USER ID:", mockSurvey.userId);
      console.log("MOCK SURVEY:", mockSurvey);

      survey = await createSurvey(mockSurvey);
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        { status: 400 },
      );
    }

    const document = await uploadSurveyDocument(survey, file);

    const surveyId = survey.id && survey.id.trim() ? survey.id : null;

    if (!surveyId) {
      throw new Error("Survey ID is missing after survey creation.");
    }

    const savedDocument = await createSurveyDocument(surveyId, document);

    console.log("DOCUMENT SAVED:", savedDocument);

    return NextResponse.json({
      success: true,
      document: savedDocument,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
