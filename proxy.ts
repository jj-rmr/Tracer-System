import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth";

const AUTH_ROUTES = ["/signin", "/signup"];

const VERIFY_ROUTES = ["/verify-email", "/confirm-verification"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isVerifyRoute = VERIFY_ROUTES.includes(pathname);

  const hasSession = request.cookies.has(AUTH_COOKIE);

  if (!hasSession) {
    if (isAuthRoute || isVerifyRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  console.log({
    pathname,
    hasSession,
    cookies: request.cookies.getAll().map((c) => c.name),
  });
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
