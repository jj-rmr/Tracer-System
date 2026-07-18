// lib/auth/roles.ts

import { Models } from "node-appwrite";
import { Role, ROLES } from "@/types";

export function getRole(user: Models.User<Models.Preferences>): Role | null {
  if (user.labels.includes(ROLES.ADMIN)) {
    return ROLES.ADMIN;
  }

  if (user.labels.includes(ROLES.ALUMNI)) {
    return ROLES.ALUMNI;
  }

  return null;
}

export function requireRole(
  user: Models.User<Models.Preferences>,
  allowed: Role[],
) {
  const role = getRole(user);

  if (!role || !allowed.includes(role)) {
    throw new Error("Forbidden");
  }

  return role;
}

export function isAdmin(user: Models.User<Models.Preferences>) {
  return user.labels.includes(ROLES.ADMIN);
}

export function isAlumni(user: Models.User<Models.Preferences>) {
  return user.labels.includes(ROLES.ALUMNI);
}
