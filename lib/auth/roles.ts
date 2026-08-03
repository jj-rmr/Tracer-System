import type { AuthUser } from "./types";
import { type Role, ROLES } from "../../types/roles.ts";
import {
  isValidOrganizationGrant,
  resolveOrganizationGrantPrograms,
} from "../programs/catalog.ts";

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

export function isCoordinator(user: AuthUser) {
  return user.role === ROLES.COORDINATOR;
}

export function isStaff(user: AuthUser) {
  return isAdmin(user) || isCoordinator(user);
}

export function getAllowedProgramValues(user: AuthUser): string[] | null {
  if (isAdmin(user)) return null;
  if (!isCoordinator(user)) return [];

  return [
    ...new Set(
      user.coordinatorGrants
        .filter(isValidOrganizationGrant)
        .flatMap(resolveOrganizationGrantPrograms),
    ),
  ];
}

export function canAccessProgram(user: AuthUser, program: unknown) {
  if (isAdmin(user)) return true;
  return (
    typeof program === "string" &&
    getAllowedProgramValues(user)?.includes(program) === true
  );
}

export function canManageResponse(
  user: AuthUser,
  response: {
    userId: string | null;
    enteredByUserId: string | null;
    source: string;
    status: string;
    answers: Record<string, unknown>;
  },
) {
  if (isAdmin(user)) return true;
  if (isCoordinator(user)) {
    if (canAccessProgram(user, response.answers.program)) return true;
    return (
      response.source === "admin_import" &&
      response.status === "draft" &&
      response.enteredByUserId === user.id &&
      (typeof response.answers.program !== "string" ||
        !response.answers.program.trim())
    );
  }
  return response.userId === user.id;
}

export function canManageManualResponse(
  user: AuthUser,
  response: Parameters<typeof canManageResponse>[1],
) {
  return (
    response.source === "admin_import" && canManageResponse(user, response)
  );
}
