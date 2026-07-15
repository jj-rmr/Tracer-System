import { NextRequest, NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { getSessionCookie } from "@/lib/auth";
import { createSessionClient } from "@/lib/appwrite/session";

export async function POST(request: NextRequest) {
  try {
    const { userId, secret } = await request.json();

    if (!userId || !secret) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_REQUEST",
        },
        { status: 400 },
      );
    }

    const session = await getSessionCookie();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const account = new Account(createSessionClient(session));

    const me = await account.get();

    if (me.$id !== userId) {
      return NextResponse.json(
        {
          success: false,
          code: "SESSION_MISMATCH",
        },
        { status: 409 },
      );
    }

    await account.updateEmailVerification({
      userId,
      secret,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: "VERIFY_FAILED",
        message: error?.message,
      },
      { status: 400 },
    );
  }
}
