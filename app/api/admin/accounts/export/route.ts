import {
  exportAccountsCsv,
  getAccountExportRows,
} from "@/lib/exports/accounts";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createStyledWorkbook } from "@/lib/exports/excel";
import { recordUserAuditEvent } from "@/lib/repositories/audit.repository";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  if (format !== "csv" && format !== "xlsx") {
    return NextResponse.json(
      { success: false, message: "Invalid export format." },
      { status: 400 },
    );
  }

  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const rows = await getAccountExportRows();

  await recordUserAuditEvent(admin, {
    action: "accounts.exported",
    targetType: "account_collection",
    metadata: { format, rowCount: rows.length },
  });

  if (format === "xlsx") {
    const workbook = await createStyledWorkbook("Accounts", rows);
    return new NextResponse(new Uint8Array(workbook), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="EXPORTED-ACCOUNTS-${timestamp}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(exportAccountsCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="EXPORTED-ACCOUNTS-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
