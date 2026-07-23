// src/app/api/auth/me-id/route.ts

import { ok, fail } from "@/lib/api/responses";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  try {
    const { user } = await requireUser();

    return ok({
      id: user.$id,
    });
  } catch {
    return fail("Unauthorized", 401);
  }
}
