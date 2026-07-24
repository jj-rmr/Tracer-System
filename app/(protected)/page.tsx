import { redirect } from "next/navigation";

import { getRole, requireUser } from "@/lib/auth";
import { ROLES } from "@/types";

export default async function ProtectedPage() {
  const { user } = await requireUser();

  const role = getRole(user);

  if (role === ROLES.ADMIN) {
    redirect("/admin");
  }

  if (role === ROLES.ALUMNI) {
    redirect("/alumni");
  }

  redirect("/unauthorized");
}
