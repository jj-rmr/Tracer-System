// app/api/surveys/export/route.ts

import {
  exportAccountsCsv,
  getAccountExportRows,
} from "@/lib/exports/accounts";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createStyledWorkbook } from "@/lib/exports/excel";

export async function GET(request: NextRequest) {
  await requireAdmin();
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

  if (format === "xlsx") {
    const workbook = await createStyledWorkbook(
      "Accounts",
      await getAccountExportRows(),
    );
    return new NextResponse(new Uint8Array(workbook), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="EXPORTED-ACCOUNTS-${timestamp}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(await exportAccountsCsv(), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="EXPORTED-ACCOUNTS-${timestamp}.csv"`,
    },
  });
}
