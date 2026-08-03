import { NextRequest, NextResponse } from "next/server";

import {
  InvalidResponseQueryError,
  parseAdminResponseQuery,
} from "@/lib/admin/response-query";
import { getAllowedProgramValues, requireStaff } from "@/lib/auth";
import {
  exportResponsesCsv,
  getResponseExportRows,
} from "@/lib/exports/responses";
import { createStyledWorkbook } from "@/lib/exports/excel";
import { recordSecurityAuditEvent } from "@/lib/repositories/audit.repository";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff();

    const { filters } = parseAdminResponseQuery(request.nextUrl.searchParams);
    const format = request.nextUrl.searchParams.get("format") ?? "csv";
    if (format !== "csv" && format !== "xlsx") {
      throw new InvalidResponseQueryError("Invalid export format.");
    }
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const rows = await getResponseExportRows(
      filters,
      getAllowedProgramValues(staff),
    );

    await recordSecurityAuditEvent({
      actorUserId: staff.id,
      action: "responses.exported",
      targetType: "response_collection",
      metadata: { format, rowCount: rows.length },
    });

    if (format === "xlsx") {
      const workbook = await createStyledWorkbook("Tracer Responses", rows);
      return new NextResponse(new Uint8Array(workbook), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="TRACER-RESPONSES-${timestamp}.xlsx"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(exportResponsesCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="TRACER-RESPONSES-${timestamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const invalidQuery = error instanceof InvalidResponseQueryError;

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to export responses.",
      },
      { status: invalidQuery ? 400 : 500 },
    );
  }
}
