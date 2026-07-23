import { redirect } from "next/navigation";
import { getCurrentUser } from "./current-user";
import { requireRole } from "./roles";
import { Role, ROLES } from "@/types";

/**
 * Ensures the user is logged in via Appwrite OAuth cookie.
 * If no active session exists, redirects to /signin.
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // Strict domain check (@parsu.edu.ph)
  if (!user.email.toLowerCase().endsWith("@parsu.edu.ph")) {
    redirect("/signin?error=unauthorized_domain");
  }

  return user;
}

/**
 * Guarantees the user is logged in and email verified.
 * (Google OAuth accounts are verified by default in Appwrite).
 */
export async function requireVerifiedUser() {
  const user = await requireUser();

  if (!user.emailVerification) {
    redirect("/verify-email");
  }

  return user;
}

/**
 * Restricts access to users matching specific role labels (e.g. ['ADMIN', 'ALUMNI']).
 */
export async function requireUserRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();

  // 1. If no session, redirect to signin
  if (!user) {
    redirect("/signin");
  }

  // 2. Validate institutional domain
  if (!user.email.toLowerCase().endsWith("@parsu.edu.ph")) {
    redirect("/signin?error=unauthorized_domain");
  }

  // 3. Verify user labels against allowed roles
  try {
    requireRole(user, allowedRoles);
  } catch {
    // If authenticated but lacks the required role (e.g. ALUMNI trying to access /admin)
    redirect("/alumni");
  }

  return user;
}

/**
 * Restricts access exclusively to ADMIN role users.
 */
export async function requireAdmin() {
  const user = await requireVerifiedUser();

  try {
    requireRole(user, [ROLES.ADMIN]);
  } catch {
    redirect("/unauthorized");
  }

  return user;
}
