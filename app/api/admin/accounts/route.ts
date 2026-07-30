import { NextResponse } from "next/server";
import { getAllAccounts } from "@/lib/repositories/accounts.repository";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const accounts = await getAllAccounts();

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load accounts.",
      },
      {
        status: 500,
      },
    );
  }
}
