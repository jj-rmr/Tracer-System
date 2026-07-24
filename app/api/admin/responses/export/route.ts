import { NextRequest, NextResponse } from "next/server";

import {
  InvalidResponseQueryError,
  parseAdminResponseQuery,
} from "@/lib/admin/response-query";
import { requireAdmin } from "@/lib/auth";
import { exportResponsesCsv } from "@/lib/exports/responses";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { filters } = parseAdminResponseQuery(request.nextUrl.searchParams);
    const csv = await exportResponsesCsv(filters);
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
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
