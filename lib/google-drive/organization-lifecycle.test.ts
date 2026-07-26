import assert from "node:assert/strict";
import test from "node:test";

import { runDriveOrganization } from "./organization-lifecycle.ts";

test("records a successful Drive organization in order", async () => {
  const events: string[] = [];

  await runDriveOrganization({
    markStarted: async () => void events.push("organizing"),
    organize: async () => void events.push("folder-ready"),
    markOrganized: async () => void events.push("organized"),
    markFailed: async () => void events.push("failed"),
  });

  assert.deepEqual(events, ["organizing", "folder-ready", "organized"]);
});

test("records failure and preserves the original Drive error", async () => {
  const events: string[] = [];
  const driveError = new Error("Drive unavailable");

  await assert.rejects(
    runDriveOrganization({
      markStarted: async () => void events.push("organizing"),
      organize: async () => {
        events.push("folder-failed");
        throw driveError;
      },
      markOrganized: async () => void events.push("organized"),
      markFailed: async (error) => {
        assert.equal(error, driveError);
        events.push("failed");
      },
    }),
    (error) => error === driveError,
  );

  assert.deepEqual(events, ["organizing", "folder-failed", "failed"]);
});

test("does not create folders after deletion has claimed the response", async () => {
  const events: string[] = [];

  await runDriveOrganization({
    markStarted: async () => {
      events.push("claim-rejected");
      return false;
    },
    organize: async () => void events.push("folder-ready"),
    markOrganized: async () => void events.push("organized"),
    markFailed: async () => void events.push("failed"),
  });

  assert.deepEqual(events, ["claim-rejected"]);
});
