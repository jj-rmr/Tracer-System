import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireUser } from "@/lib/auth";
import { getFormResponse } from "@/lib/repositories/form-responses.repository";
import { getOpenStudyByFormSlug } from "@/lib/repositories/forms.repository";
import { ROLES } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { user } = await requireUser();
    requireRole(user, [ROLES.ALUMNI]);

    const { slug } = await params;
    const context = await getOpenStudyByFormSlug(slug);

    if (!context) {
      return NextResponse.json(
        {
          success: false,
          message: "This form is not currently open for responses.",
        },
        { status: 404 },
      );
    }

    const response = await getFormResponse(context.study.id, user.$id);

    return NextResponse.json({
      success: true,
      data: {
        ...context,
        response,
      },
    });
  } catch (error) {
    console.error("Failed to load active form:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load the active form.",
      },
      { status: 500 },
    );
  }
}
