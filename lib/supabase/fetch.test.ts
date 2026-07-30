import assert from "node:assert/strict";
import test from "node:test";

import { isFutureIssuedJwtError } from "./errors.ts";

test("recognizes Supabase's transient future-issued JWT response", () => {
  assert.equal(
    isFutureIssuedJwtError({
      code: "PGRST303",
      message: "JWT issued at future",
    }),
    true,
  );
});

test("does not retry unrelated authentication failures", () => {
  assert.equal(
    isFutureIssuedJwtError({ code: "PGRST303", message: "JWT expired" }),
    false,
  );
  assert.equal(
    isFutureIssuedJwtError({ code: "PGRST301", message: "Invalid JWT" }),
    false,
  );
  assert.equal(isFutureIssuedJwtError(null), false);
});
