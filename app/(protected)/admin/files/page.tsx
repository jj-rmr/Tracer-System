import DriveFileBrowser from "@/components/admin/files/DriveFileBrowser";
import { requireAdmin } from "@/lib/auth";

export default async function FilesPage() {
  await requireAdmin();

  return <DriveFileBrowser />;
}
