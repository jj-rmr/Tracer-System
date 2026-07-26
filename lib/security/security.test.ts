import assert from "node:assert/strict";
import test from "node:test";

import { spreadsheetSafeRecord, spreadsheetSafeValue } from "./csv.ts";
import { validateUpload } from "./uploads.ts";

test("neutralizes spreadsheet formula prefixes", () => {
  assert.equal(
    spreadsheetSafeValue('=HYPERLINK("bad")'),
    '\'=HYPERLINK("bad")',
  );
  assert.equal(spreadsheetSafeValue("@SUM(A1:A2)"), "'@SUM(A1:A2)");
  assert.equal(spreadsheetSafeValue("ordinary text"), "ordinary text");
  assert.deepEqual(spreadsheetSafeRecord({ name: "+cmd", count: 2 }), {
    name: "'+cmd",
    count: 2,
  });
});

test("accepts a PDF with matching extension, MIME type, and signature", async () => {
  const file = new File(
    [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])],
    "proof.pdf",
    {
      type: "application/pdf",
    },
  );
  await assert.doesNotReject(validateUpload(file, "document"));
});

test("rejects disguised and unsupported uploads", async () => {
  const disguised = new File(["not a pdf"], "proof.pdf", {
    type: "application/pdf",
  });
  const executable = new File(["MZ"], "payload.exe", {
    type: "application/octet-stream",
  });
  await assert.rejects(validateUpload(disguised, "document"), /contents/);
  await assert.rejects(validateUpload(executable, "admin"), /not allowed/);
});
