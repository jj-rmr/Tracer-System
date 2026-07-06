// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Client, Account } from "node-appwrite"; // Use the node server SDK package

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname === "/";

  if (isProtectedRoute) {
    // 1. Locate the active session cookie
    const sessionCookie = request.cookies
      .getAll()
      .find((c) => c.name.startsWith("a_session_"));

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    try {
      // 2. Initialize a fresh, dedicated Server SDK client for this request
      const serverClient = new Client()
        .setEndpoint(
          process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
            "https://cloud.appwrite.io/v1",
        )
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

      // 3. Inject the session secret directly into the server client wrapper
      serverClient.setSession(sessionCookie.value);

      const serverAccount = new Account(serverClient);

      // 4. Fetch the real, authenticated user profile
      const userData = await serverAccount.get();

      // 5. Explicitly block if email verification is false
      if (userData && userData.emailVerification === false) {
        return NextResponse.redirect(new URL("/verify-email", request.url));
      }
    } catch (error) {
      // If the token is invalid, expired, or an unauthorized guest, boot them to signin
      console.error("Middleware Auth Verification Denied:", error);
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
