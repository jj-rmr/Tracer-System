import { NextResponse } from "next/server";
import { Users } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";
import { formatAccount } from "@/lib/repositories/accounts.repository";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const client = createAdminClient();
    const users = new Users(client);

    const result = await users.list();

    const accounts = result.users.map(formatAccount);

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load accounts.",
      },
      {
        status: 500,
      },
    );
  }
}
