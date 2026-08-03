import { stringify } from "csv-stringify/sync";

import { listSecurityAuditEvents } from "@/lib/repositories/audit.repository";
import { spreadsheetSafeRecord } from "@/lib/security/csv";

interface AuditEventExportFilters {
  search?: string;
  category?: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export async function getAuditEventExportRows(
  filters: AuditEventExportFilters = {},
) {
  const events = [];
  const limit = 1000;
  let page = 1;
  let total = 0;

  do {
    const result = await listSecurityAuditEvents({
      ...filters,
      page,
      limit,
    });
    events.push(...result.events);
    total = result.total;
    page += 1;
  } while (events.length < total);

  return events.map((event) =>
    spreadsheetSafeRecord({
      time: formatDate(event.createdAt),
      actorName: event.actorName ?? "",
      actorEmail: event.actorEmail ?? "",
      actorUserId: event.actorUserId,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId ?? "",
      details: JSON.stringify(event.metadata),
    }),
  );
}

export function exportAuditEventsCsv(rows: Record<string, unknown>[]) {
  return rows.length === 0 ? "" : stringify(rows, { header: true });
}
