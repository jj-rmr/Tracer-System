import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { formResponseToSurvey } from "@/lib/forms/graduate-tracer-adapter";
import {
  getFormResponseDocuments,
  listFormResponses,
} from "@/lib/repositories/form-responses.repository";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? "10"));
    const search = (searchParams.get("search") ?? "").trim().toLowerCase();
    const responseRecords = await listFormResponses();
    const filtered = search
      ? responseRecords.filter((response) =>
          [
            response.respondentName,
            response.respondentEmail,
            response.answers.firstName,
            response.answers.middleName,
            response.answers.lastName,
          ].some((value) =>
            typeof value === "string"
              ? value.toLowerCase().includes(search)
              : false,
          ),
        )
      : responseRecords;
    const pageResponses = filtered.slice((page - 1) * limit, page * limit);
    const responseViews = await Promise.all(
      pageResponses.map(async (response) =>
        formResponseToSurvey(
          response,
          await getFormResponseDocuments(response.id),
        ),
      ),
    );

    return NextResponse.json({
      success: true,
      responses: responseViews,
      total: filtered.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load responses.",
      },
      { status: 400 },
    );
  }
}
