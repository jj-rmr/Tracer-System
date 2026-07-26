import { Account } from "node-appwrite";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { createSessionClient } from "@/lib/appwrite/session";

export async function POST() {
  try {
    const { session, user } = await requireUser();
    const notice = user.prefs.roleChangeNotice;

    if (typeof notice !== "string" || !notice) {
      return NextResponse.json(
        { success: true, notice: null },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const nextPrefs = { ...user.prefs };
    delete nextPrefs.roleChangeNotice;
    const account = new Account(createSessionClient(session));
    await account.updatePrefs(nextPrefs);

    return NextResponse.json(
      { success: true, notice },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to consume role-change notice:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load account notification." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
