// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Client, Account } from "node-appwrite";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname === "/";

  if (isProtectedRoute) {
    const sessionCookie = request.cookies
      .getAll()
      .find((c) => c.name.startsWith("a_session_"));

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    try {
      const serverClient = new Client()
        .setEndpoint(
          process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
            "https://cloud.appwrite.io/v1",
        )
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

      serverClient.setSession(sessionCookie.value);

      const serverAccount = new Account(serverClient);

      const userData = await serverAccount.get();

      if (userData && userData.emailVerification === false) {
        return NextResponse.redirect(new URL("/verify-email", request.url));
      }
    } catch (error) {
      console.error("Middleware Auth Verification Denied:", error);
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
