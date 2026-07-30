import type { AuthUser } from "./types";
import { type Role, ROLES } from "../../types/roles.ts";

export function getRole(user: AuthUser): Role {
  return user.role;
}

export function requireRole(user: AuthUser, allowed: Role[]) {
  const role = getRole(user);

  if (!role || !allowed.includes(role)) {
    throw new Error("Forbidden");
  }

  return role;
}

export function isAdmin(user: AuthUser) {
  return user.role === ROLES.ADMIN;
}
