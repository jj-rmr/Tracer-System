export const ROLES = {
  ADMIN: "admin",
  COORDINATOR: "coordinator",
  ALUMNI: "alumni",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const COORDINATOR_SCOPE_TYPES = {
  CAMPUS: "campus",
  COLLEGE: "college",
  PROGRAM: "program",
} as const;

export type CoordinatorScopeType =
  (typeof COORDINATOR_SCOPE_TYPES)[keyof typeof COORDINATOR_SCOPE_TYPES];

export interface CoordinatorScopeGrant {
  id?: string;
  scopeType: CoordinatorScopeType;
  campus: string;
  college: string | null;
  program: string | null;
}
