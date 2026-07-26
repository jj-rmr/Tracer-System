import { Client } from "node-appwrite";
import { requiredServerEnv } from "@/lib/server/env";

export function createClient() {
  return new Client()
    .setEndpoint(requiredServerEnv("APPWRITE_ENDPOINT"))
    .setProject(requiredServerEnv("APPWRITE_PROJECT_ID"));
}
