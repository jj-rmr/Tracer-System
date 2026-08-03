import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { listSecurityAuditEvents } from "@/lib/repositories/audit.repository";

const CATEGORIES = new Set([
  "account",
  "authentication",
  "document",
  "file",
  "response",
  "study",
]);

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = positiveInteger(searchParams.get("page"), 1);
    const limit = Math.min(50, positiveInteger(searchParams.get("limit"), 10));
    const search =
      searchParams.get("search")?.trim().slice(0, 100) || undefined;
    const requestedCategory = searchParams.get("category")?.trim();
    const category =
      requestedCategory && CATEGORIES.has(requestedCategory)
        ? requestedCategory
        : undefined;

    const result = await listSecurityAuditEvents({
      page,
      limit,
      search,
      category,
    });

    return NextResponse.json(
      { success: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load security audit events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load the activity log." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
