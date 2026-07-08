// app/api/appwrite/appwrite.ts
import { Client, Users, Query } from "node-appwrite";
import { unstable_cache } from "next/cache";

export interface AppwriteMember {
  name: string;
  email: string;
  emailVerification: boolean;
  registration: string;
  labels: string[];
}

export interface PaginatedMembers {
  users: AppwriteMember[];
  total: number;
}

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    get users() {
      return new Users(client);
    },
  };
}

async function fetchRawPaginatedMembers(
  limit: number,
  offset: number,
): Promise<PaginatedMembers> {
  const { users } = createAdminClient();
  const response = await users.list([Query.limit(limit), Query.offset(offset)]);

  return {
    users: response.users as unknown as AppwriteMember[],
    total: response.total,
  };
}

export async function getPaginatedMembers(
  limit: number,
  offset: number,
): Promise<PaginatedMembers> {
  const getCachedData = unstable_cache(
    async () => fetchRawPaginatedMembers(limit, offset),
    [`members-limit-${limit}-offset-${offset}`],
    {
      revalidate: 30,
      tags: ["members-directory"],
    },
  );

  return getCachedData();
}
