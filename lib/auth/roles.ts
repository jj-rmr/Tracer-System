// lib/auth/roles.ts

import { Models } from "node-appwrite";

export type Role = "Admin" | "Alumni";

export function getRole(user: Models.User<Models.Preferences>): Role {
  if (user.labels.includes("Admin")) {
    return "Admin";
  }

  return "Alumni";
}

export function requireRole(
  user: Models.User<Models.Preferences>,
  allowed: Role[],
) {
  const role = getRole(user);

  if (!allowed.includes(role)) {
    throw new Error("Forbidden");
  }

  return role;
}

export function isAdmin(user: Models.User<Models.Preferences>) {
  return user.labels.includes("Admin");
}

export function isAlumni(user: Models.User<Models.Preferences>) {
  return user.labels.includes("Alumni");
}
