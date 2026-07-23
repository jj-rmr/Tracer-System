import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import {
  createStudyPeriod,
  listPublishedFormVersions,
  listStudyPeriodSummaries,
} from "@/lib/repositories/study-admin.repository";

const ACADEMIC_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

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
    const opensAt = typeof body.opensAt === "string" ? body.opensAt : "";
    const closesAt = typeof body.closesAt === "string" ? body.closesAt : "";
    const openingTime = new Date(opensAt).getTime();
    const closingTime = new Date(closesAt).getTime();

    if (
      !formVersionId ||
      !isValidAcademicYear(academicYear) ||
      !title ||
      !Number.isFinite(openingTime) ||
      !Number.isFinite(closingTime) ||
      closingTime <= openingTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid form, academic year, title, and schedule.",
        },
        { status: 400 },
      );
    }

    const study = await createStudyPeriod({
      formVersionId,
      academicYear,
      title,
      opensAt: new Date(openingTime).toISOString(),
      closesAt: new Date(closingTime).toISOString(),
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
