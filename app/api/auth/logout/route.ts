import { NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { createSessionClient } from "@/lib/appwrite/session";
import { AUTH_COOKIE, COOKIE_OPTIONS, getSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSessionCookie();

    if (session) {
      const client = createSessionClient(session);
      const account = new Account(client);

      try {
        // Delete the current Appwrite session
        await account.deleteSessions();
      } catch {
        // Session may already be invalid or expired.
        // We still want to clear the browser cookie.
      }
    }
  } catch {
    // Ignore any unexpected errors and continue clearing the cookie.
  }

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(AUTH_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
