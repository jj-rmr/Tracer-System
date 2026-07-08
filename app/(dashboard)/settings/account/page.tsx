import { getSessionUser } from "@/app/actions/cache";
import AccountForm from "@/components/AccountForm";
import Link from "next/link";

export default async function AccountSettingsPage() {
  const user = await getSessionUser();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href="/settings"
        className="text-sm text-sky-500 hover:underline mb-4 block"
      >
        &larr; Back to Settings
      </Link>

      <h1 className="text-3xl font-bold">Account Details</h1>
      <p className="text-slate-500 mb-6">
        Update your public profile information.
      </p>

      <AccountForm initialUser={user} />
    </div>
  );
}
