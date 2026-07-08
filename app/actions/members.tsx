"use server";

import { revalidateTag } from "next/cache";

export async function clearMembersCache() {
  revalidateTag("members-directory", "max");
}
