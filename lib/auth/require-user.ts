import { redirect } from "next/navigation";

import { getCurrentUser } from "./current-user";
import { getSessionCookie } from "./cookies";
import { requireRole, type Role } from "./roles";

export async function requireUser() {
  const session = await getSessionCookie();

  if (!session) {
    redirect("/signin");
  }

  const user = await getCurrentUser(session);

  if (!user) {
    redirect("/signin");
  }

  return {
    session,
    user,
  };
}

export async function requireVerifiedUser() {
  const { user } = await requireUser();

  if (!user.emailVerification) {
    redirect("/verify-email");
  }

  return user;
}

export async function requireUserRole(allowed: Role[]) {
  const user = await requireVerifiedUser();

  try {
    requireRole(user, allowed);
  } catch {
    redirect("/");
  }

  return user;
}
