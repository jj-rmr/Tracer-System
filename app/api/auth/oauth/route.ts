import { NextResponse } from "next/server";

export async function GET() {
  const state = crypto.randomUUID();

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleAuthUrl.searchParams.set(
    "client_id",
    process.env.GOOGLE_AUTH_CLIENT_ID!,
  );

  googleAuthUrl.searchParams.set(
    "redirect_uri",
    process.env.GOOGLE_AUTH_REDIRECT_URI!,
  );

  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl);

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
