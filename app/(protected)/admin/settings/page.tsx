import SettingsPage from "@/components/settings/SettingsPage";
import { requireUserRole } from "@/lib/auth";
import { ROLES } from "@/types";
import { getProfilePictureUrl } from "@/lib/repositories/accounts.repository";

export default async function AdminSettingsPage() {
  const user = await requireUserRole([ROLES.ADMIN]);

  return (
    <SettingsPage
      name={user.name}
      email={user.email}
      role={ROLES.ADMIN}
      pictureUrl={getProfilePictureUrl(user.prefs)}
    />
  );
}
