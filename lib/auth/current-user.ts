import { Account } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/session";
import { EXTERNAL_TIMEOUTS, withExternalTimeout } from "@/lib/server/timeouts";

export async function getCurrentUser(session: string | null) {
  if (!session) return null;

  const client = createSessionClient(session);
  const account = new Account(client);

  try {
    return await withExternalTimeout(
      account.get(),
      EXTERNAL_TIMEOUTS.authentication,
    );
  } catch (error) {
    console.error("Appwrite session validation failed:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return null;
  }
}
