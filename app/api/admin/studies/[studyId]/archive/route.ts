import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import { archiveStudyPeriod } from "@/lib/repositories/study-admin.repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  try {
    await requireAdmin();

    const { studyId } = await params;
    const context = await getStudyContext(studyId);

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    if (context.study.status !== "closed") {
      return NextResponse.json(
        {
          success: false,
          message: "Only closed study periods can be archived.",
        },
        { status: 409 },
      );
    }

    const study = await archiveStudyPeriod(studyId);

    return NextResponse.json({ success: true, data: study });
  } catch (error) {
    console.error("Failed to archive study period:", error);

    return NextResponse.json(
      { success: false, message: "Failed to archive study period." },
      { status: 500 },
    );
  }
}
