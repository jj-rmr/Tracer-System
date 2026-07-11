import { cookies } from "next/headers";
import { AUTH_COOKIE, COOKIE_OPTIONS } from "./constants";

export async function getSessionCookie() {
  const store = await cookies();

  return store.get(AUTH_COOKIE)?.value ?? null;
}

export async function setSessionCookie(value: string) {
  const store = await cookies();

  store.set(AUTH_COOKIE, value, COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const store = await cookies();

  store.delete(AUTH_COOKIE);
}
