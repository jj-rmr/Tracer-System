import { stringify } from "csv-stringify/sync";
import { getAllAccounts } from "@/lib/repositories/accounts.repository";
import { spreadsheetSafeRecord } from "@/lib/security/csv";

export async function getAccountExportRows() {
  const accounts = await getAllAccounts();
  return accounts.map((formatAccount) =>
    spreadsheetSafeRecord({
      id: formatAccount.id,
      name: formatAccount.name,
      email: formatAccount.email,
      role: formatAccount.role,
      coordinatorAssignments: formatAccount.coordinatorGrants
        .map((grant) =>
          [grant.scopeType, grant.campus, grant.college, grant.program]
            .filter(Boolean)
            .join(" / "),
        )
        .join("; "),
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
    }),
  );
}

export function exportAccountsCsv(rows: Record<string, unknown>[]) {
  return rows.length === 0 ? "" : stringify(rows, { header: true });
}
