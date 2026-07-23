import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import {
  deleteFormResponse,
  getFormResponseById,
  getFormResponseDocuments,
} from "@/lib/repositories/form-responses.repository";

interface ResponseRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: ResponseRouteProps) {
  try {
    await requireAdmin();
    const { id } = await params;
    const response = await getFormResponseById(id);

    if (!response) {
      return NextResponse.json(
        { success: false, message: "Response not found." },
        { status: 404 },
      );
    }

    const responseView = formResponseToSurvey(
      response,
      await getFormResponseDocuments(response.id),
    );
    return NextResponse.json({ success: true, response: responseView });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load response.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: ResponseRouteProps,
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteFormResponse(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete response.",
      },
      { status: 400 },
    );
  }
}
