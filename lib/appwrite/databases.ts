import { Databases } from "node-appwrite";
import { createAdminClient } from "./admin";

export function createDatabases() {
  return new Databases(createAdminClient());
}
