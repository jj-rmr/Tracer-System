import { Models, Users } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite/admin";
import { ROLES } from "@/types";

function getUsersService() {
  const client = createAdminClient();

  return new Users(client);
}

export function formatAccount(user: Models.User<Models.Preferences>) {
  return {
    id: user.$id,
    name: user.name,
    email: user.email,

    role: user.labels.includes(ROLES.ADMIN) ? "admin" : "alumni",

    verified: user.emailVerification,

    labels: user.labels ?? [],

    createdAt: user.$createdAt,
    updatedAt: user.$updatedAt,
  };
}

export async function getAccount(id: string) {
  const users = getUsersService();

  const user = await users.get(id);

  return formatAccount(user);
}

export async function getAllAccounts() {
  const users = getUsersService();

  const response = await users.list();

  return response.users.map(formatAccount);
}

export async function updateAccountName(id: string, name: string) {
  const users = getUsersService();

  return await users.updateName(id, name);
}

export async function updateAccountRole(id: string, role: "admin" | "alumni") {
  const users = getUsersService();
  const account = await users.get(id);
  const labels = account.labels.filter(
    (label) => label !== ROLES.ADMIN && label !== ROLES.ALUMNI,
  );

  const roleChangeNotice =
    role === ROLES.ADMIN
      ? "You have been promoted to admin."
      : "You have been demoted to alumni.";
  const nextPrefs = { ...account.prefs, roleChangeNotice };

  await users.updatePrefs(id, nextPrefs);
  try {
    return await users.updateLabels(id, [...labels, role]);
  } catch (error) {
    await users.updatePrefs(id, account.prefs).catch(() => undefined);
    throw error;
  }
}

export async function deleteAccount(id: string) {
  const users = getUsersService();

  return await users.delete(id);
}
