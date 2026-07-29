import { Account } from "node-appwrite";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE,
  COOKIE_OPTIONS,
  getSessionCookie,
} from "@/lib/auth";
import { isInvalidSessionError } from "@/lib/auth/errors";
import { createSessionClient } from "@/lib/appwrite/session";
import {
  EXTERNAL_TIMEOUTS,
  withExternalTimeout,
} from "@/lib/server/timeouts";

export async function POST() {
  const secret = await getSessionCookie();

  if (!secret) {
    return NextResponse.json(
      { success: false, message: "No active session." },
      { status: 401 },
    );
  }

  try {
    const account = new Account(createSessionClient(secret));
    const session = await withExternalTimeout(
      account.updateSession({ sessionId: "current" }),
      EXTERNAL_TIMEOUTS.authentication,
    );
    const response = NextResponse.json({ success: true });

    response.cookies.set(AUTH_COOKIE, secret, {
      ...COOKIE_OPTIONS,
      expires: new Date(session.expire),
    });

    return response;
  } catch (error) {
    console.error("Appwrite session refresh failed:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    if (isInvalidSessionError(error)) {
      const response = NextResponse.json(
        { success: false, message: "Session expired." },
        { status: 401 },
      );
      response.cookies.set(AUTH_COOKIE, "", {
        ...COOKIE_OPTIONS,
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json(
      { success: false, message: "Session refresh is temporarily unavailable." },
      { status: 503 },
    );
  }
}
