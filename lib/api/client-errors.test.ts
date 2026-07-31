import assert from "node:assert/strict";
import test from "node:test";

import { friendlyRequestMessage, readApiJson } from "./client-errors.ts";

test("replaces an HTML API response with the action-specific fallback", async () => {
  const response = new Response("<!DOCTYPE html><title>Error</title>", {
    status: 500,
    headers: { "Content-Type": "text/html" },
  });

  await assert.rejects(
    readApiJson(response, "Your draft could not be saved."),
    (error: Error) => {
      assert.equal(error.message, "Your draft could not be saved.");
      assert.doesNotMatch(error.message, /Unexpected token|DOCTYPE/i);
      return true;
    },
  );
});

test("does not display parser details from an action failure", () => {
  const message = friendlyRequestMessage(
    new SyntaxError("Unexpected token '<'"),
    "The response could not be saved. Please try again.",
  );

  assert.equal(message, "The response could not be saved. Please try again.");
});
