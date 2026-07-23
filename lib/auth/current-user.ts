// lib/auth/current-user.ts
import { createSessionClient } from "@/lib/appwrite/appwrite-server";

export async function getCurrentUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
}
