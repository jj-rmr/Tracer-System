// app/api/alumni/profile/route.ts

import { ok, fail } from "@/lib/api/response";
import { requireUser } from "@/lib/auth";
import { alumniProfileRepository } from "@/lib/repositories/alumni.repository";

export async function GET() {
  try {
    const { session, user } = await requireUser();

    const profile = await alumniProfileRepository.getByUserId(
      session,
      user.$id,
    );

    return ok(profile);
  } catch {
    return fail("Unauthorized", 401);
  }
}
