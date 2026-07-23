import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

/**
 * Creates an Appwrite client bound to the current user's OAuth session cookie.
 * Use this in Next.js API routes / Server Actions to identify the logged-in user.
 */
// lib/appwrite/appwrite-server.ts
export async function createSessionClient() {
  console.log("🔥 createSessionClient called");

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!);

  const cookieStore = await cookies();

  const allCookies = cookieStore.getAll();

  console.log(
    "🔥 Available cookies:",
    allCookies.map((cookie) => cookie.name),
  );

  const sessionCookie = allCookies.find((cookie) =>
    cookie.name.startsWith("a_session_"),
  );

  console.log("🔥 Found Appwrite cookie:", sessionCookie?.name || "NONE");

  if (sessionCookie?.value) {
    client.setSession(sessionCookie.value);
  }

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

/**
 * Creates an admin Appwrite client using your private API Key.
 * Use this for administrative tasks (e.g., inspecting labels or revoking access).
 */
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createServices() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore
    .getAll()
    .find((c) => c.name.startsWith("a_session_"));

  if (sessionCookie?.value) {
    client.setSession(sessionCookie.value);
  }

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}
