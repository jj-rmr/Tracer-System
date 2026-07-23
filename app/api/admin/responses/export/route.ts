// app/api/admin/responses/export/route.ts

import { exportResponsesCsv } from "@/lib/exports/responses";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdmin();
  const csv = await exportResponsesCsv();

  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="TRACER-RESPONSES-${timestamp}.csv"`,
    },
  });
}
