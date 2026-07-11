import { NextRequest, NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";
import { createSessionClient } from "@/lib/appwrite/session";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        {
          status: 400,
        },
      );
    }

    // Authenticate the user
    const adminAccount = new Account(createAdminClient());

    const session = await adminAccount.createEmailPasswordSession(
      email,
      password,
    );

    // Create a client using the new session
    const sessionAccount = new Account(createSessionClient(session.secret));

    const user = await sessionAccount.get();

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set(AUTH_COOKIE, session.secret, {
      ...COOKIE_OPTIONS,
      expires: new Date(session.expire),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Invalid email or password.",
      },
      {
        status: 401,
      },
    );
  }
}
