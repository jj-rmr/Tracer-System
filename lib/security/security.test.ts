import assert from "node:assert/strict";
import test from "node:test";

import { spreadsheetSafeRecord, spreadsheetSafeValue } from "./csv.ts";
import { InMemoryRateLimiter } from "./rate-limit.ts";
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

test("limits requests until their window expires", () => {
  const limiter = new InMemoryRateLimiter();

  assert.equal(limiter.consume("client", 2, 1_000, 0).limited, false);
  assert.equal(limiter.consume("client", 2, 1_000, 1).limited, false);

  const rejected = limiter.consume("client", 2, 1_000, 2);
  assert.equal(rejected.limited, true);
  assert.equal(rejected.retryAfterSeconds, 1);
  assert.equal(limiter.consume("client", 2, 1_000, 1_000).limited, false);
});

test("removes expired buckets and keeps its memory bounded", () => {
  const limiter = new InMemoryRateLimiter(2, 100);

  limiter.consume("expired", 1, 10, 0);
  limiter.consume("active", 1, 1_000, 0);
  limiter.consume("replacement", 1, 1_000, 100);

  assert.equal(limiter.consume("expired", 1, 1_000, 101).limited, false);

  limiter.consume("third", 1, 1_000, 102);
  assert.equal(limiter.consume("active", 1, 1_000, 103).limited, false);
});
