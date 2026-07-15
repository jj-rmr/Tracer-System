import { createClient } from "./client";

// export function createAdminClient() {
//   return createClient().setKey(process.env.APPWRITE_API_KEY!);
// }

import { Client } from "node-appwrite";

let client: Client | null = null;

export function createAdminClient() {
  if (client) return client;

  client = new Client();
  createClient().setKey(process.env.APPWRITE_API_KEY!);

  return client;
}
