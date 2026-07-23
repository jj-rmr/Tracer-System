import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./constants";

export async function getSessionCookie() {
  const store = await cookies();

  return store.get(AUTH_COOKIE)?.value ?? null;
}
