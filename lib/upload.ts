export function sanitizeForFilename(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 128);
}

function pad(value: number, length = 2) {
  return String(value).padStart(length, "0");
}

export function formatTimestamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const month = parts.month || "00";
  const day = parts.day || "00";
  const year = parts.year || "0000";
  const hour = parts.hour || "00";
  const minute = parts.minute || "00";
  const second = parts.second || "00";

  return `${month}-${day}-${year}_${hour}-${minute}-${second}`;
}

export function buildRenamedFilename(name: string, formName: string, originalFilename: string, date = new Date()) {
  const safeName = sanitizeForFilename(name || "unknown");
  const safeFormName = sanitizeForFilename(formName || "form");
  const timestamp = formatTimestamp(date);
  const extension = originalFilename.split(".").pop() || "dat";

  return `${safeName}_${safeFormName}_${timestamp}.${extension}`;
}

export function createDownloadResponse(file: File, name: string, formName: string) {
  const filename = buildRenamedFilename(name, formName, file.name);

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
