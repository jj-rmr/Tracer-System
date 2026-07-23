import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite/appwrite-server";

export async function GET() {
  try {
    console.log("🔥 TEST AUTH ROUTE CALLED");

    const { account } = await createSessionClient();

    const user = await account.get();

    console.log("🔥 SERVER USER:", user.email);

    return NextResponse.json({
      success: true,
      email: user.email,
    });
  } catch (error) {
    console.error("🔥 SERVER AUTH FAILED:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 401 },
    );
  }
}
