import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { authProvider } from "@/lib/auth/provider";

export async function POST() {
  try {
    const { user } = await requireUser();
    const notice = await authProvider.consumeRoleChangeNotice(user);
    return NextResponse.json(
      { success: true, notice },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to consume role-change notice:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load account notification." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
