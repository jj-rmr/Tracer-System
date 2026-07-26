import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth";

const AUTH_ROUTES = ["/signin"];
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function clientAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authRequest = pathname.startsWith("/api/auth/");
  const exportRequest = pathname.endsWith("/export");
  const windowMs = authRequest ? 10 * 60_000 : 60_000;
  const maximum = exportRequest ? 10 : authRequest ? 30 : 120;
  const key = `${clientAddress(request)}:${authRequest ? "auth" : exportRequest ? "export" : "mutation"}`;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= maximum) return null;

  return NextResponse.json(
    { success: false, message: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
      },
    },
  );
}

function protectApiRequest(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const isMultipart = request.headers
    .get("content-type")
    ?.startsWith("multipart/form-data");
  const maximumBytes = isMultipart ? 11 * 1024 * 1024 : 1024 * 1024;
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    return NextResponse.json(
      { success: false, message: "Request body is too large." },
      { status: 413 },
    );
  }

  if (MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { success: false, message: "Cross-origin requests are not allowed." },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) return protectApiRequest(request);

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
