import { requireUserRole } from "@/lib/auth/require-user";
import { ROLES } from "@/types";

export default async function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserRole([ROLES.ALUMNI]);

  return children;
}
