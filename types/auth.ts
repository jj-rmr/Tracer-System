export const ROLES = {
  ADMIN: "Admin",
  PLACEMENT: "Placement",
  ALUMNI: "Alumni",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
