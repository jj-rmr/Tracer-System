// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { createServices } from "@/lib/appwrite/appwrite-server";

export async function GET() {
  try {
    const { account } = await createServices();
    const user = await account.get();

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
}
