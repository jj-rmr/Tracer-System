import { getSessionCookie } from "./cookies";
import { createSessionClient } from "@/lib/appwrite/session";

export async function getSessionClient() {
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  return createSessionClient(session);
}
