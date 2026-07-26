import assert from "node:assert/strict";
import test from "node:test";

import { canChangeResponseDocuments } from "./response-document-lifecycle.ts";

test("allows alumni document changes only while the study is open", () => {
  assert.equal(
    canChangeResponseDocuments({ source: "alumni", studyStatus: "open" }),
    true,
  );
  assert.equal(
    canChangeResponseDocuments({ source: "alumni", studyStatus: "closed" }),
    false,
  );
  assert.equal(
    canChangeResponseDocuments({ source: "alumni", studyStatus: "archived" }),
    false,
  );
});

test("allows admins to maintain historical import documents after closure", () => {
  assert.equal(
    canChangeResponseDocuments({
      source: "admin_import",
      studyStatus: "closed",
    }),
    true,
  );
  assert.equal(
    canChangeResponseDocuments({
      source: "admin_import",
      studyStatus: "archived",
    }),
    true,
  );
});
