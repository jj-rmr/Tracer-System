import { requireUserRole } from "@/lib/auth/require-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserRole(["Admin"]);

  return children;
}
