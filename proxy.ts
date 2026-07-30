import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";

import { AUTH_COOKIE } from "@/lib/auth";
import { InMemoryRateLimiter } from "@/lib/security/rate-limit";
import { classifyRateLimitedRequest } from "@/lib/security/rate-limit-policy";

const AUTH_ROUTES = ["/signin"];
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const rateLimiter = new InMemoryRateLimiter();

function clientAddress(request: NextRequest) {
  const trustProxyHeaders =
    process.env.VERCEL === "1" || process.env.TRUST_PROXY_HEADERS === "true";

  if (!trustProxyHeaders) return "untrusted-proxy";

  const candidates = [
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    request.headers.get("x-real-ip")?.trim(),
  ];

  return (
    candidates.find((candidate) => candidate && isIP(candidate)) ?? "unknown"
  );
}

function rateLimit(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestClass = classifyRateLimitedRequest(pathname, request.method);
  if (!requestClass) return null;

  const windowMs = requestClass === "auth" ? 10 * 60_000 : 60_000;
  const maximum =
    requestClass === "export" ? 10 : requestClass === "auth" ? 30 : 120;
  const key = `${clientAddress(request)}:${requestClass}`;
  const result = rateLimiter.consume(key, maximum, windowMs);
  if (!result.limited) return null;

  return NextResponse.json(
    { success: false, message: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
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
