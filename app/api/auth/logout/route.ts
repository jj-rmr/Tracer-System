import { NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { createSessionClient } from "@/lib/appwrite/session";
import { getSessionCookie } from "@/lib/auth";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSessionCookie();

    if (session) {
      try {
        const client = createSessionClient(session);
        const account = new Account(client);

        // Delete the current Appwrite session
        await account.deleteSession("current");
      } catch {
        // Ignore if session is already invalid
      }
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.delete(AUTH_COOKIE);

    return response;
  } catch {
    const response = NextResponse.json({
      success: true,
    });

    response.cookies.delete(AUTH_COOKIE);

    return response;
  }
}
