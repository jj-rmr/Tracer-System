import { NextResponse } from "next/server";
import { Users } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";
import { formatAccount } from "@/lib/repositories/accounts.repository";

export async function GET() {
  try {
    const client = createAdminClient();
    const users = new Users(client);

    const result = await users.list();

    const accounts = result.users.map(formatAccount);

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
