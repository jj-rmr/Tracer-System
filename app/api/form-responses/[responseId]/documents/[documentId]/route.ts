import { NextRequest, NextResponse } from "next/server";

import { canManageResponse, requireUser } from "@/lib/auth";
import { canChangeResponseDocuments } from "@/lib/forms/response-document-lifecycle";
import { deleteDriveFile } from "@/lib/google-drive/files";
import {
  deleteFormResponseDocument,
  getFormResponseById,
  getFormResponseDocument,
} from "@/lib/repositories/form-responses.repository";
import { getStudyContext } from "@/lib/repositories/forms.repository";

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ responseId: string; documentId: string }>;
  },
) {
  try {
    const { user } = await requireUser();
    const { responseId, documentId } = await params;
    const [response, document] = await Promise.all([
      getFormResponseById(responseId),
      getFormResponseDocument(documentId),
    ]);

    if (
      !response ||
      !document ||
      document.response_id !== responseId ||
      !canManageResponse(user, response)
    ) {
      return NextResponse.json(
        { success: false, message: "Document not found." },
        { status: 404 },
      );
    }

    const studyContext = await getStudyContext(response.studyPeriodId);

    if (
      !studyContext ||
      !canChangeResponseDocuments({
        source: response.source,
        studyStatus: studyContext.study.status,
      })
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This study is closed and its documents are read-only.",
        },
        { status: 423 },
      );
    }

    await deleteDriveFile(document.google_drive_file_id);
    await deleteFormResponseDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete response document:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete document.",
      },
      { status: 500 },
    );
  }
}
