import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth";

const AUTH_ROUTES = ["/signin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const hasSession = !!request.cookies.get(AUTH_COOKIE)?.value;

  if (!hasSession) {
    if (isAuthRoute) {
      return NextResponse.next();
    }

    const signInUrl = new URL("/signin", request.url);

    return NextResponse.redirect(signInUrl);
  }
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
