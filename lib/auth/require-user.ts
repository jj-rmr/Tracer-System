import { getCurrentUser } from "./current-user";
import { getSessionCookie } from "./cookies";

export async function requireUser() {
  const session = await getSessionCookie();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await getCurrentUser(session);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    session,
    user,
  };
}
