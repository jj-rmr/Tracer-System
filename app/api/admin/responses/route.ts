import { NextRequest, NextResponse } from "next/server";

import {
  InvalidResponseQueryError,
  parseAdminResponseQuery,
} from "@/lib/admin/response-query";
import { requireAdmin } from "@/lib/auth";
import { listAdminResponseSummaries } from "@/lib/repositories/admin-responses.repository";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const query = parseAdminResponseQuery(request.nextUrl.searchParams);
    const result = await listAdminResponseSummaries(query);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const invalidQuery = error instanceof InvalidResponseQueryError;

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load responses.",
      },
      { status: invalidQuery ? 400 : 500 },
    );
  }
}
