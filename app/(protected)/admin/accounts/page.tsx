import { requireUser } from "@/lib/auth";
import AccountsPageClient from "./AccountsPageClient";

export default async function AccountsPage() {
  const { user } = await requireUser();

  return <AccountsPageClient currentUserId={user.$id} />;
}
