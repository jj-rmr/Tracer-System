"use server";

import { createNextServerHelpers } from "@appwrite.io/react/server/next";
import { Client, Account } from "node-appwrite";
import { unstable_cache, updateTag } from "next/cache";
import { createHash } from "crypto";

const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
};

const getSafeCacheKey = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

const fetchUserFromAppwrite = unstable_cache(
  async (sessionToken: string) => {
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setSession(sessionToken);

    const account = new Account(client);
    try {
      const user = await account.get();
      return user
        ? {
            name: user.name,
            email: user.email,
            emailVerification: user.emailVerification,
          }
        : null;
    } catch {
      return null;
    }
  },
  ["appwrite-user-profile"],
  { revalidate: 3600 },
);

export async function getSessionUser() {
  const helpers = createNextServerHelpers(appwriteConfig);
  const sessionToken = await helpers.readSessionCookie();

  if (!sessionToken) return null;

  return await fetchUserFromAppwrite(sessionToken);
}

export async function clearUserCache() {
  const helpers = createNextServerHelpers(appwriteConfig);
  const sessionToken = await helpers.readSessionCookie();

  if (sessionToken) {
    const safeKey = getSafeCacheKey(sessionToken);
    updateTag(`user-profile-${safeKey}`);
  }
}
