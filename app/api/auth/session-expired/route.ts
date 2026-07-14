import { NextResponse } from "next/server";

import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/signin", request.url));

  response.cookies.set(AUTH_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
