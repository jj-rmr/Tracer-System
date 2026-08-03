import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import {
  exportAuditEventsCsv,
  getAuditEventExportRows,
} from "@/lib/exports/audit-events";
import { recordUserAuditEvent } from "@/lib/repositories/audit.repository";

const CATEGORIES = new Set([
  "account",
  "authentication",
  "document",
  "file",
  "response",
  "study",
]);

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const format = request.nextUrl.searchParams.get("format") ?? "csv";
    if (format !== "csv") {
      return NextResponse.json(
        { success: false, message: "Invalid export format." },
        { status: 400 },
      );
    }

    const search =
      request.nextUrl.searchParams.get("search")?.trim().slice(0, 100) ||
      undefined;
    const requestedCategory = request.nextUrl.searchParams
      .get("category")
      ?.trim();
    const category =
      requestedCategory && CATEGORIES.has(requestedCategory)
        ? requestedCategory
        : undefined;
    const rows = await getAuditEventExportRows({ search, category });

    await recordUserAuditEvent(admin, {
      action: "activity_log.exported",
      targetType: "security_audit_event_collection",
      metadata: {
        format,
        rowCount: rows.length,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
      },
    });

    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    return new NextResponse(exportAuditEventsCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ACTIVITY-LOG-${timestamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export security audit events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export the activity log." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
