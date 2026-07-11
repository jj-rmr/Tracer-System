import { NextRequest, NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { createSessionClient } from "@/lib/appwrite/session";
import { getSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { userId, secret } = await request.json();

    if (!userId || !secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing verification tokens.",
        },
        { status: 400 },
      );
    }

    const session = await getSessionCookie();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const account = new Account(createSessionClient(session));

    await account.updateVerification(userId, secret);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Failed to verify email.",
      },
      { status: 400 },
    );
  }
}
