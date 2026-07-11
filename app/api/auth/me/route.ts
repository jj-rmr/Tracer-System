import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await requireUser();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }
}
