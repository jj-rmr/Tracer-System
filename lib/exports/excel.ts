import ExcelJS from "exceljs";

const HEADER_NAMES: Record<string, string> = {
  id: "Account ID",
  responseId: "Response ID",
  studyPeriodId: "Study Period ID",
  userId: "User ID",
  respondentName: "Respondent Name",
  respondentEmail: "Respondent Email",
  createdAt: "Created At",
  updatedAt: "Updated At",
  submittedAt: "Submitted At",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  extensionName: "Name Extension",
  yearGraduated: "Year Graduated",
  employmentStatus: "Employment Status",
};

function titleCase(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cellValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return String(value);
}

export async function createStyledWorkbook(
  sheetName: string,
  rows: Record<string, unknown>[],
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tracer System";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 20 },
  });

  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  worksheet.columns = keys.map((key) => ({
    key,
    header: HEADER_NAMES[key] ?? titleCase(key),
    width: 12,
  }));

  rows.forEach((row) => {
    worksheet.addRow(
      Object.fromEntries(keys.map((key) => [key, cellValue(row[key])])),
    );
  });

  const header = worksheet.getRow(1);
  header.height = 28;
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF059669" },
  };

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: Math.max(keys.length, 1) },
  };
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "top", wrapText: true };
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFECFDF5" },
        };
      }
    }
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  worksheet.columns.forEach((column) => {
    let longest = String(column.header ?? "").length;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      longest = Math.max(longest, String(cell.value ?? "").length);
    });
    column.width = Math.min(Math.max(longest + 2, 12), 42);
  });

  return workbook.xlsx.writeBuffer();
}
