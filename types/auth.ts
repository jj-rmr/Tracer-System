export const ROLES = {
  ADMIN: "Admin",
  ALUMNI: "Alumni",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
