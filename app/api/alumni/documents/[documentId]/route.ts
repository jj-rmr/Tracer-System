import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireUser, isAdmin } from "@/lib/auth";

import { ROLES } from "@/types";

import {
  getSurveyDocumentWithSurveyId,
  deleteSurveyDocument,
} from "@/lib/repositories/survey-documents.repository";

import { deleteFromDrive } from "@/lib/google/google-drive/upload";
import { getSurveyById } from "@/lib/repositories/surveys.repository";
import { drive } from "@/lib/google/google-drive";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI]);

    const { documentId } = await params;

    const result = await getSurveyDocumentWithSurveyId(documentId);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 },
      );
    }

    const { document, surveyId } = result;

    const survey = await getSurveyById(surveyId);

    if (!survey || survey.userId !== user.$id) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this document.",
        },
        { status: 403 },
      );
    }

    await deleteFromDrive(document.googleDriveFileId);

    const deletedDocument = await deleteSurveyDocument(documentId);

    return NextResponse.json({
      success: true,
      document: deletedDocument,
    });
  } catch (error) {
    console.error("DELETE DOCUMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete document.",
      },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ALUMNI, ROLES.ADMIN]);

    const { documentId } = await params;

    const result = await getSurveyDocumentWithSurveyId(documentId);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 },
      );
    }

    const { document, surveyId } = result;

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

    if (!isAdmin(user) && survey.userId !== user.$id) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to view this document.",
        },
        { status: 403 },
      );
    }

    const response = await drive.files.get(
      {
        fileId: document.googleDriveFileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      },
    );

    const fileBuffer = Buffer.from(response.data as ArrayBuffer);

    const isPdf = document.mimeType === "application/pdf";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": isPdf
          ? `inline; filename="${document.filename}"`
          : `attachment; filename="${document.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("GET DOCUMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve document.",
      },
      { status: 500 },
    );
  }
}
