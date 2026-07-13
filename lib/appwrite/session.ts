import { createClient } from "./client";

export function createSessionClient(session: string) {
  return createClient().setSession(session);
}
