import { NextResponse } from "next/server";

import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";
import { authProvider } from "@/lib/auth/provider";

export async function POST() {
  try {
    await authProvider.refreshSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, "1", {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error("Authentication session refresh failed:", error);
    const response = NextResponse.json(
      { success: false, message: "Session expired." },
      { status: 401 },
    );
    response.cookies.set(AUTH_COOKIE, "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    return response;
  }
}
