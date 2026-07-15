import { NextRequest, NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";

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

    const account = new Account(createAdminClient());

    await account.updateEmailVerification({
      userId,
      secret,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Failed to verify email.",
      },
      { status: 400 },
    );
  }
}
