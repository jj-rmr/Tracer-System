import { createClient } from "./client";
import { requiredServerEnv } from "@/lib/server/env";

export function createAdminClient() {
  return createClient().setKey(requiredServerEnv("APPWRITE_API_KEY"));
}
