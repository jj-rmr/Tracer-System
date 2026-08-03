import { NextResponse } from "next/server";

import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";
import { authProvider } from "@/lib/auth/provider";
import { recordUserAuditEventSafely } from "@/lib/repositories/audit.repository";

export async function POST() {
  const user = await authProvider.getCurrentUser().catch(() => null);

  try {
    await authProvider.signOut();
  } catch (error) {
    console.error("Failed to sign out provider session:", error);
  }

  if (user) {
    await recordUserAuditEventSafely(user, {
      action: "authentication.signed_out",
      targetType: "session",
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
