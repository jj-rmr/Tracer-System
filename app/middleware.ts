// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith("/") || pathname === "/";

  if (isProtectedRoute) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("appwrite-session-"));

    if (!hasSession) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
