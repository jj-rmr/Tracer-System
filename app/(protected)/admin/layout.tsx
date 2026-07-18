import { requireUserRole } from "@/lib/auth/require-user";
import { ROLES } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserRole([ROLES.ADMIN]);
  console.log("Admin page rendered (layout)");

  return children;
}
