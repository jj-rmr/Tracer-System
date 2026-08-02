import { after, NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getStudyContext } from "@/lib/repositories/forms.repository";
import {
  deleteStudyPeriod,
  updateStudyPeriodSchedule,
} from "@/lib/repositories/study-admin.repository";
import { recordSecurityAuditEventSafely } from "@/lib/repositories/audit.repository";
import {
  deleteStudyDriveFolder,
  moveStudyDriveFolderToAdminFiles,
} from "@/lib/google-drive/study-cleanup";

export async function PATCH(
  request: NextRequest,
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

    if (
      context.study.status === "closed" ||
      context.study.status === "archived"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Closed or archived study periods cannot be rescheduled.",
        },
        { status: 423 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const opensAt = typeof body.opensAt === "string" ? body.opensAt : "";
    const closesAt = typeof body.closesAt === "string" ? body.closesAt : "";
    const openingTime = new Date(opensAt).getTime();
    const closingTime = new Date(closesAt).getTime();

    if (
      !title ||
      !Number.isFinite(openingTime) ||
      !Number.isFinite(closingTime) ||
      closingTime <= openingTime
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid title and schedule." },
        { status: 400 },
      );
    }

    if (
      context.study.status === "open" &&
      new Date(context.study.opensAt).getTime() !== openingTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The opening time cannot change after a study has opened.",
        },
        { status: 409 },
      );
    }

    const study = await updateStudyPeriodSchedule({
      studyPeriodId: studyId,
      title,
      opensAt: new Date(openingTime).toISOString(),
      closesAt: new Date(closingTime).toISOString(),
    });

    return NextResponse.json({ success: true, data: study });
  } catch (error) {
    console.error("Failed to update study period:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update study period." },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const body = (await request.json().catch(() => ({}))) as {
      moveFilesToAdmin?: unknown;
    };
    const moveFilesToAdmin = body.moveFilesToAdmin === true;
    const filesMoved = moveFilesToAdmin
      ? await moveStudyDriveFolderToAdminFiles({ studyId })
      : false;
    const deletedResponseCount = await deleteStudyPeriod(studyId);

    if (deletedResponseCount === null) {
      return NextResponse.json(
        { success: false, message: "Study period not found." },
        { status: 404 },
      );
    }

    await recordSecurityAuditEventSafely({
      actorUserId: admin.id,
      action: "study.deleted",
      targetType: "study_period",
      targetId: studyId,
      metadata: {
        academicYear: context.study.academicYear,
        deletedResponseCount,
        moveFilesToAdmin,
        filesMoved,
      },
    });

    if (!moveFilesToAdmin) {
      after(async () => {
        try {
          await deleteStudyDriveFolder(studyId);
        } catch (error) {
          console.error("Failed to delete the study Drive folder:", error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: { deletedResponseCount, filesMoved },
    });
  } catch (error) {
    console.error("Failed to delete study period:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete study period." },
      { status: 500 },
    );
  }
}
