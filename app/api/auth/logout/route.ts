import { NextResponse } from "next/server";

import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";
import { authProvider } from "@/lib/auth/provider";

export async function POST() {
  try {
    await authProvider.signOut();
  } catch (error) {
    console.error("Failed to sign out provider session:", error);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
