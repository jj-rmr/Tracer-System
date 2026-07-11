import { Account } from "node-appwrite";
import { createAdminClient } from "./admin";

export function createAdminAccount() {
  return new Account(createAdminClient());
}
