import assert from "node:assert/strict";
import test from "node:test";

import { isInvalidSessionError } from "./errors.ts";

test("recognizes an explicit unauthorized response as an invalid session", () => {
  assert.equal(isInvalidSessionError({ code: 401 }), true);
});

test("does not invalidate sessions for transient Appwrite failures", () => {
  assert.equal(isInvalidSessionError({ code: 500 }), false);
  assert.equal(
    isInvalidSessionError(new Error("External service request timed out.")),
    false,
  );
  assert.equal(isInvalidSessionError(null), false);
});
