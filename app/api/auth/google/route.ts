import { NextResponse } from "next/server";

import { createGoogleSignInClient } from "@/lib/google/oauth";

export async function GET() {
  const state = crypto.randomUUID();
  const googleClient = createGoogleSignInClient();
  const authorizationUrl = googleClient.generateAuthUrl({
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state,
  });

  const response = NextResponse.redirect(authorizationUrl);

  response.headers.set("Cache-Control", "no-store");
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
