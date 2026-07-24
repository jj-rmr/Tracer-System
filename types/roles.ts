export const ROLES = {
  ADMIN: "admin",
  ALUMNI: "alumni",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
