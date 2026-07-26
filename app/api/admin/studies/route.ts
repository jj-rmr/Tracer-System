import { after, NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { initializeStudyDriveHierarchy } from "@/lib/google-drive/initialize-hierarchy";
import { syncGoogleDriveIndex } from "@/lib/google-drive/sync-index";
import {
  createStudyPeriod,
  listPublishedFormVersions,
  listStudyPeriodSummaries,
} from "@/lib/repositories/study-admin.repository";

const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

export const maxDuration = 300;

function isValidAcademicYear(value: string) {
  const match = ACADEMIC_YEAR_PATTERN.exec(value);

  return !!match && Number(match[2]) === Number(match[1]) + 1;
}

export async function GET() {
  try {
    await requireAdmin();

    const [studies, formVersions] = await Promise.all([
      listStudyPeriodSummaries(),
      listPublishedFormVersions(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        studies,
        formVersions,
      },
    });
  } catch (error) {
    console.error("Failed to list study periods:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load study periods." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = (await request.json()) as Record<string, unknown>;
    const formVersionId =
      typeof body.formVersionId === "string" ? body.formVersionId : "";
    const academicYear =
      typeof body.academicYear === "string" ? body.academicYear.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (
      !formVersionId ||
      !isValidAcademicYear(academicYear) ||
      !title
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid form, academic year, and title.",
        },
        { status: 400 },
      );
    }

    const study = await createStudyPeriod({
      formVersionId,
      academicYear,
      title,
    });

    after(async () => {
      try {
        await initializeStudyDriveHierarchy({
          studyId: study.id,
          academicYear,
        });
        await syncGoogleDriveIndex();
      } catch (error) {
        console.error("Failed to prepare folders for the new study:", error);
      }
    });

    return NextResponse.json(
      { success: true, data: study },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create study period:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create study period.",
      },
      { status: 500 },
    );
  }
}
