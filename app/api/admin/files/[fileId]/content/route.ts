import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getDriveFileContent } from "@/lib/google-drive/browser";

function safeFilename(value: string) {
  return value.replace(/[\r\n"]/g, "_");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    await requireAdmin();

    const { fileId } = await params;
    const content = await getDriveFileContent(
      fileId,
      request.headers.get("range") ?? undefined,
    );
    const headers = new Headers({
      "Content-Type": content.contentType,
      "Content-Disposition": `inline; filename="${safeFilename(content.item.name ?? "file")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
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
