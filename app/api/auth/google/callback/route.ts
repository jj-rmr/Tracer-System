import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google/google-drive";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing authorization code.",
      },
      {
        status: 400,
      },
    );
  }

  const { tokens } = await oauth2Client.getToken(code);

  return NextResponse.json({
    success: true,
    message:
      "Authorization successful. Check your terminal for the refresh token.",
  });
}
