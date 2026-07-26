import assert from "node:assert/strict";
import test from "node:test";

import { hasResponseOrganizationChanged } from "./response-organization-change.ts";

test("organizes new responses and identity or program changes", () => {
  assert.equal(hasResponseOrganizationChanged(null, {}), true);
  assert.equal(
    hasResponseOrganizationChanged(
      { firstName: "Ana", program: "bsit" },
      { firstName: "Anne", program: "bsit" },
    ),
    true,
  );
});

test("does not reorganize for unrelated draft changes", () => {
  assert.equal(
    hasResponseOrganizationChanged(
      { firstName: "Ana", program: "bsit", companyName: "Old" },
      { firstName: "Ana", program: "bsit", companyName: "New" },
    ),
    false,
  );
});
