import { Account } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/session";

export async function getCurrentUser(session: string | null) {
  if (!session) return null;

  const client = createSessionClient(session);
  const account = new Account(client);

  try {
    return await account.get();
  } catch {
    return null;
  }
}
