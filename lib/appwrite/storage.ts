import { Storage } from "node-appwrite";
import { createAdminClient } from "./admin";

export function createStorage() {
  return new Storage(createAdminClient());
}
