import { stringify } from "csv-stringify/sync";
import { getAllAccounts } from "@/lib/repositories/accounts.repository";

export async function exportAccountsCsv() {
  const accounts = await getAllAccounts();

  if (accounts.length === 0) {
    return "";
  }

  const rows = accounts.map((formatAccount) => ({
    id: formatAccount.id,
    name: formatAccount.name,
    email: formatAccount.email,
    role: formatAccount.role,
    verified: formatAccount.verified,
    labels: formatAccount.labels,
    createdAt: formatAccount.createdAt
      ? new Date(formatAccount.createdAt).toLocaleString("en-PH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "",

    updatedAt: formatAccount.updatedAt
      ? new Date(formatAccount.updatedAt).toLocaleString("en-PH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "",
  }));

  return stringify(rows, {
    header: true,
  });
}
