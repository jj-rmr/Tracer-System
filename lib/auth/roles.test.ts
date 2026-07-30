import assert from "node:assert/strict";
import test from "node:test";

import { getRole, isAdmin, requireRole } from "./roles.ts";
import type { AuthUser } from "./types.ts";

function user(role: AuthUser["role"]): AuthUser {
  return {
    id: "canonical-id",
    providerUserId: "provider-id",
    name: "Test User",
    email: "test@parsu.edu.ph",
    pictureUrl: null,
    role,
    emailVerified: true,
    enabled: true,
    roleChangeNotice: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

test("role checks operate on the provider-neutral auth user", () => {
  const admin = user("admin");
  const alumni = user("alumni");

  assert.equal(getRole(admin), "admin");
  assert.equal(isAdmin(admin), true);
  assert.equal(isAdmin(alumni), false);
  assert.equal(requireRole(alumni, ["alumni"]), "alumni");
  assert.throws(() => requireRole(alumni, ["admin"]), /Forbidden/);
});
