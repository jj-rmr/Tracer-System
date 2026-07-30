import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import { setStudyPeriodStatus } from "@/lib/repositories/study-admin.repository";
import { recordSecurityAuditEventSafely } from "@/lib/repositories/audit.repository";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { studyId } = await params;
    const context = await getStudyContext(studyId);

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as { status?: unknown };
    if (body.status !== "open" && body.status !== "closed") {
      return NextResponse.json(
        { success: false, message: "Choose open or closed status." },
        { status: 400 },
      );
    }

    if (context.study.status === body.status) {
      return NextResponse.json({ success: true, data: context.study });
    }

    const study = await setStudyPeriodStatus(studyId, body.status);
    await recordSecurityAuditEventSafely({
      actorUserId: admin.id,
      action: "study.status_changed",
      targetType: "study_period",
      targetId: studyId,
      metadata: { from: context.study.status, to: body.status },
    });
    return NextResponse.json({ success: true, data: study });
  } catch (error) {
    console.error("Failed to change study status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change study status." },
      { status: 500 },
    );
  }
}
