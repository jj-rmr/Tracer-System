import { NextResponse } from "next/server";

import { createGoogleDriveAuthorizationClient } from "@/lib/google/oauth";

const STATE_COOKIE = "google_drive_oauth_state";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const state = crypto.randomUUID();
  const googleClient = createGoogleDriveAuthorizationClient();
  const authorizationUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive"],
    state,
  });
  const response = NextResponse.redirect(authorizationUrl);

  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/api/auth/google-drive",
    maxAge: 10 * 60,
  });

  return response;
}
