// app/api/surveys/export/route.ts

import { exportSurveysCsv } from "@/lib/supabase/export";
import { NextResponse } from "next/server";

export async function GET() {
  const csv = await exportSurveysCsv();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="surveys.csv"',
    },
  });
}
