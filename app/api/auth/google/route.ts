import { NextResponse } from "next/server";

import { authProvider } from "@/lib/auth/provider";

export async function GET(request: Request) {
  try {
    const url = await authProvider.getGoogleAuthorizationUrl(
      new URL(request.url).origin,
    );
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Failed to start Google sign-in:", error);
    return NextResponse.redirect(
      new URL("/signin?error=oauth_failed", request.url),
    );
  }
}
