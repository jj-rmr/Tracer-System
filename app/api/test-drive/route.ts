import { NextRequest, NextResponse } from "next/server";

import { getSurveyById } from "@/lib/repositories/surveys.repository";
import { uploadSurveyDocument } from "@/lib/google/google-drive/upload-survey-document";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const surveyId = formData.get("surveyId") as string;

    const file = formData.get("file");

    if (!surveyId || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing surveyId or file",
        },
        {
          status: 400,
        },
      );
    }

    const survey = await getSurveyById(surveyId);

    console.log("SURVEY FOUND");

    const document = await uploadSurveyDocument(survey, file);

    console.log("UPLOAD SERVICE DONE");

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
