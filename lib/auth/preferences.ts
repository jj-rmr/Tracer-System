import { Users } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/admin";

export async function getUserPreferences(userId: string) {
  const adminClient = createAdminClient();

  const users = new Users(adminClient);

  const user = await users.get(userId);

  return user.prefs ?? {};
}
