import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireUser } from "@/lib/auth";
import { ROLES } from "@/types";

import { getSurveyById } from "@/lib/repositories/surveys.repository";
import { createSurveyDocument } from "@/lib/repositories/survey-documents.repository";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const body = await request.json();

    const {
      surveyId,
      documentType,
      filename,
      mimeType,
      size,
      googleDriveFileId,
      googleDriveFolderId,
      webViewLink,
    } = body;

    if (
      typeof surveyId !== "string" ||
      typeof filename !== "string" ||
      typeof mimeType !== "string" ||
      typeof size !== "number" ||
      typeof googleDriveFileId !== "string" ||
      typeof googleDriveFolderId !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document data.",
        },
        { status: 400 },
      );
    }

    if (documentType !== "employment" && documentType !== "awards") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type.",
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

    const document = {
      id: crypto.randomUUID(),
      filename,
      mimeType,
      size,
      googleDriveFileId,
      googleDriveFolderId,
      uploadedAt: new Date().toISOString(),
      documentType,
      metadata: {
        source: "google-drive" as const,
        webViewLink,
      },
    };

    const savedDocument = await createSurveyDocument(surveyId, document);

    return NextResponse.json({
      success: true,
      document: savedDocument,
    });
  } catch (error) {
    console.error("COMPLETE UPLOAD ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Failed to save document.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
