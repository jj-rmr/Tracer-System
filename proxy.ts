// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createNextServerHelpers } from "@appwrite.io/react/server/next";

const authRoutes = ["/signin", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  const helpers = createNextServerHelpers({
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  });

  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
  const cookieName = `appwrite-session-${projectId}`;
  const hasCookie = request.cookies.has(cookieName);

  if (!hasCookie) {
    if (!isAuthRoute && pathname !== "/verify-email") {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  try {
    const user = await helpers.getLoggedInUser();

    if (!user) {
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.delete(cookieName);
      return response;
    }

    const isVerified = user.emailVerification === true;

    if (!isVerified) {
      if (pathname !== "/verify-email") {
        return NextResponse.redirect(new URL("/verify-email", request.url));
      }
      return NextResponse.next();
    }

    if (isAuthRoute || pathname === "/verify-email") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    const response = NextResponse.redirect(new URL("/signin", request.url));
    response.cookies.delete(cookieName);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
