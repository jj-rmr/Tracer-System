import { createClient } from "./client";

export function createAdminClient() {
  return createClient().setKey(process.env.APPWRITE_API_KEY!);
}
