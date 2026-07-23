import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  console.log("PROXY:", request.nextUrl.pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
