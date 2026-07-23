import SettingsPage from "@/components/settings/SettingsPage";
import { requireUserRole } from "@/lib/auth";
import { ROLES } from "@/types";

export default async function AlumniSettingsPage() {
  const user = await requireUserRole([ROLES.ALUMNI]);

  return (
    <SettingsPage
      name={user.name}
      email={user.email}
      role={ROLES.ALUMNI}
    />
  );
}
