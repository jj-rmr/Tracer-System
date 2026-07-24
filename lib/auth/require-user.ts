import { redirect } from "next/navigation";
import { cache } from "react";

import { getCurrentUser } from "./current-user";
import { getSessionCookie } from "./cookies";
import { requireRole } from "./roles";
import { Role, ROLES } from "@/types";

export const requireUser = cache(async function requireUser() {
  const session = await getSessionCookie();

  if (!session) {
    redirect("/signin");
  }

  const user = await getCurrentUser(session);

  if (!user) {
    redirect("/api/auth/session-expired");
  }

  return {
    session,
    user,
  };
});

export async function requireUserRole(allowed: Role[]) {
  const { user } = await requireUser();

  try {
    requireRole(user, allowed);
  } catch {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireAdmin() {
  const { user } = await requireUser();

  try {
    requireRole(user, [ROLES.ADMIN]);
  } catch {
    redirect("/unauthorized");
  }

  return user;
}
