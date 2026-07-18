import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { requireRole } from "@/lib/auth/roles";

import { listSurveys } from "@/lib/repositories/surveys.repository";
import { ROLES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser();

    requireRole(user, [ROLES.ADMIN]);

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";

    const result = await listSurveys(page, limit, search);

    return NextResponse.json({
      success: true,
      documents: result.documents,
      total: result.total,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message ?? "Failed to load surveys.",
      },
      {
        status: 400,
      },
    );
  }
}
