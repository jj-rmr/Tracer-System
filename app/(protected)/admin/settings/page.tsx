import SettingsPage from "@/components/settings/SettingsPage";
import { requireStaff } from "@/lib/auth";
import { getProfilePictureUrl } from "@/lib/repositories/accounts.repository";

export default async function AdminSettingsPage() {
  const user = await requireStaff();

  return (
    <SettingsPage
      name={user.name}
      email={user.email}
      role={user.role}
      pictureUrl={getProfilePictureUrl(user)}
    />
  );
}
