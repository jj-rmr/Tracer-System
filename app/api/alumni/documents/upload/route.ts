import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireUser } from "@/lib/auth";
import { ROLES } from "@/types";

import { getSurveyById } from "@/lib/repositories/surveys.repository";
import { createSurveyDocument } from "@/lib/repositories/survey-documents.repository";

import { uploadSurveyDocument } from "@/lib/google/google-drive/upload-survey-document";
import { deleteFromDrive } from "@/lib/google/google-drive/upload";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const formData = await request.formData();

    const file = formData.get("file");
    const surveyId = formData.get("surveyId");

    if (typeof surveyId !== "string" || !surveyId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey ID is required.",
        },
        { status: 400 },
      );
    }

    const survey = await getSurveyById(surveyId);

    if (!survey) {
      return NextResponse.json(
        {
          success: false,
          message: "Survey not found.",
        },
        { status: 404 },
      );
    }

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

    let savedDocument;

    try {
      savedDocument = await createSurveyDocument(surveyId, document);
    } catch (error) {
      try {
        await deleteFromDrive(document.googleDriveFileId);
      } catch (cleanupError) {
        console.error("FAILED TO CLEAN UP DRIVE FILE:", cleanupError);
      }

      throw error;
    }

    return NextResponse.json({
      success: true,
      document: savedDocument,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to upload document.";

    const status = message === "File exceeds 10MB limit" ? 413 : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}
