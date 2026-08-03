import { NextRequest, NextResponse } from "next/server";

import { canManageResponse, isAdmin, requireStaff } from "@/lib/auth";
import { getDriveFileContent } from "@/lib/google-drive/browser";
import { getFormResponseForDriveFile } from "@/lib/repositories/form-responses.repository";

function safeFilename(value: string) {
  return value.replace(/[\r\n"]/g, "_");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const staff = await requireStaff();
    const { fileId } = await params;
    if (!isAdmin(staff)) {
      const response = await getFormResponseForDriveFile(fileId);
      if (!response || !canManageResponse(staff, response)) {
        return NextResponse.json(
          { success: false, message: "File not found." },
          { status: 404 },
        );
      }
    }
    const content = await getDriveFileContent(
      fileId,
      request.headers.get("range") ?? undefined,
    );
    const headers = new Headers({
      "Content-Type": content.contentType,
      "Content-Disposition": `inline; filename="${safeFilename(content.item.name ?? "file")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; frame-ancestors 'self'; object-src 'none'; base-uri 'none'",
      "X-Frame-Options": "SAMEORIGIN",
      "Cross-Origin-Resource-Policy": "same-origin",
    });

    if (content.contentLength) {
      headers.set("Content-Length", String(content.contentLength));
    }
    if (content.contentRange) {
      headers.set("Content-Range", String(content.contentRange));
      headers.set("Accept-Ranges", "bytes");
    }

    return new Response(content.body, {
      status: content.contentRange ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("Failed to retrieve Google Drive file:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve the Drive file.",
      },
      { status: 500 },
    );
  }
}
