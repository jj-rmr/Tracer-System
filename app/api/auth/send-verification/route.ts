import { NextRequest, NextResponse } from "next/server";
import { Account } from "node-appwrite";

import { getSessionCookie } from "@/lib/auth";

import { createSessionClient } from "@/lib/appwrite/session";

export async function POST(_request: NextRequest) {
  try {
    const session = await getSessionCookie();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const account = new Account(createSessionClient(session));

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-verification`;

    await account.createVerification(verificationUrl);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    // Email already verified
    if (error?.code === 409) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already verified.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Failed to send verification email.",
      },
      {
        status: 400,
      },
    );
  }
}
