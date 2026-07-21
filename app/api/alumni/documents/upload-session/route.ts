import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/types";

import { getSurveyById } from "@/lib/repositories/surveys.repository";
import { getOrCreateGraduateFolder } from "@/lib/google/google-drive/graduate-folder";
import { getOrCreateFolder } from "@/lib/google/google-drive/folders";
import { createDriveUploadSession } from "@/lib/google/google-drive/create-upload-session";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const body = await request.json();

    const { filename, mimeType, size, surveyId, documentType } = body;

    if (
      typeof filename !== "string" ||
      typeof mimeType !== "string" ||
      typeof size !== "number" ||
      typeof surveyId !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload data.",
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

    const MAX_SIZE = 10 * 1024 * 1024;

    if (size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File exceeds 10MB limit.",
        },
        { status: 413 },
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

    const graduateFolderId = await getOrCreateGraduateFolder(survey);

    const subfolderName =
      documentType === "employment" ? "Employment Documents" : "Awards";

    const documentFolder = await getOrCreateFolder(
      subfolderName,
      graduateFolderId,
    );

    if (!documentFolder.id) {
      throw new Error(`Failed to create or find ${subfolderName} folder`);
    }

    const requestOrigin =
      request.headers.get("origin") || request.headers.get("referer");

    const uploadUrl = await createDriveUploadSession(
      filename,
      mimeType,
      size,
      documentFolder.id,
      requestOrigin ?? undefined,
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      folderId: documentFolder.id,
    });
  } catch (error) {
    console.error("UPLOAD SESSION ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create upload session.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
