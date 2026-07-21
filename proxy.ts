import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth";

const AUTH_ROUTES = ["/signin", "/signup"];

const VERIFY_ROUTES = ["/verify-email", "/confirm-verification"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isVerifyRoute = VERIFY_ROUTES.includes(pathname);

  const hasSession = !!request.cookies.get(AUTH_COOKIE)?.value;

  if (!hasSession) {
    if (isAuthRoute || isVerifyRoute) {
      return NextResponse.next();
    }

    const signInUrl = new URL("/signin", request.url);

    const redirect = pathname + search;

    if (redirect.startsWith("/confirm-verification")) {
      signInUrl.searchParams.set("redirect", redirect);
    }

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
