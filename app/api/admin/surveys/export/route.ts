// app/api/surveys/export/route.ts

import { exportSurveysCsv } from "@/lib/supabase/export";
import { NextResponse } from "next/server";

export async function GET() {
  const csv = await exportSurveysCsv();

  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="EXPORTED-SURVEY-ENTRIES-${timestamp}.csv"`,
    },
  });
}
