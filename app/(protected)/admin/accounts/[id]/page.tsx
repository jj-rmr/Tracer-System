import { requireUser } from "@/lib/auth";
import AccountDetails from "@/components/admin/accounts/AccountDetails";

export default async function AccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();

  return <AccountDetails id={id} currentUserId={user.$id} />;
}
