import { Users } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";

function getUsersService() {
  const client = createAdminClient();

  return new Users(client);
}

export function formatAccount(user: any) {
  return {
    id: user.$id,
    name: user.name,
    email: user.email,

    role: user.labels?.includes("Admin") ? "admin" : "alumni",

    verified: user.emailVerification,

    labels: user.labels ?? [],

    createdAt: user.$createdAt,
  };
}

export async function listAccounts() {
  const users = getUsersService();

  const result = await users.list();

  return result.users.map(formatAccount);
}

export async function getAccount(id: string) {
  const users = getUsersService();

  const user = await users.get(id);

  return formatAccount(user);
}

export async function updateAccountName(id: string, name: string) {
  const users = getUsersService();

  return await users.updateName(id, name);
}

export async function deleteAccount(id: string) {
  const users = getUsersService();

  return await users.delete(id);
}
