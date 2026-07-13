import { requireUserRole } from "@/lib/auth/require-user";

export default async function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserRole(["Alumni"]);

  return children;
}
