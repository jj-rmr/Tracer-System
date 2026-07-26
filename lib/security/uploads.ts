const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

const DOCUMENT_TYPES = new Map([
  ["pdf", ["application/pdf"]],
  ["doc", ["application/msword", "application/CDFV2"]],
  [
    "docx",
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ],
]);

const ADMIN_TYPES = new Map([
  ...DOCUMENT_TYPES,
  ["csv", ["text/csv", "application/csv", "application/vnd.ms-excel"]],
  [
    "xlsx",
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ],
  ["png", ["image/png"]],
  ["jpg", ["image/jpeg"]],
  ["jpeg", ["image/jpeg"]],
]);

function extension(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

function hasSignature(bytes: Uint8Array, expected: number[]) {
  return expected.every((byte, index) => bytes[index] === byte);
}

function signatureMatches(ext: string, bytes: Uint8Array) {
  if (ext === "pdf") return hasSignature(bytes, [0x25, 0x50, 0x44, 0x46]);
  if (["docx", "xlsx"].includes(ext)) return hasSignature(bytes, [0x50, 0x4b]);
  if (ext === "doc") return hasSignature(bytes, [0xd0, 0xcf, 0x11, 0xe0]);
  if (ext === "png") return hasSignature(bytes, [0x89, 0x50, 0x4e, 0x47]);
  if (["jpg", "jpeg"].includes(ext))
    return hasSignature(bytes, [0xff, 0xd8, 0xff]);
  if (ext === "csv") return !bytes.includes(0);
  return false;
}

export async function validateUpload(file: File, scope: "document" | "admin") {
  if (file.size === 0)
    throw new UploadValidationError("The selected file is empty.");
  if (file.size > MAX_UPLOAD_BYTES)
    throw new UploadValidationError("File exceeds the 10 MB limit.");

  const ext = extension(file.name);
  const allowed = scope === "document" ? DOCUMENT_TYPES : ADMIN_TYPES;
  const mimeTypes = allowed.get(ext);
  if (!mimeTypes || !mimeTypes.includes(file.type)) {
    throw new UploadValidationError(
      `The .${ext || "unknown"} file type is not allowed.`,
    );
  }

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!signatureMatches(ext, bytes)) {
    throw new UploadValidationError(
      "The file contents do not match its declared file type.",
    );
  }
}
