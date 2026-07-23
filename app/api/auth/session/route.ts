import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    let secret = body?.secret;

    // Try to find an existing Appwrite session cookie
    if (!secret) {
      const nativeCookie = request.cookies
        .getAll()
        .find((cookie) => cookie.name.startsWith("a_session_"));

      secret = nativeCookie?.value;
    }

    if (!secret) {
      console.error("No Appwrite session secret found");

      return NextResponse.json(
        {
          success: false,
          error: "Missing session secret or cookie",
        },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("a_session_local", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Session route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to set session",
      },
      { status: 500 },
    );
  }
}
