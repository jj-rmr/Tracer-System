import { SurveyDocument, SurveyDocumentType } from "@/types";

export async function uploadFormResponseDocument(
  responseId: string,
  file: File,
  documentType: SurveyDocumentType,
  options: {
    onProgress?: (percentage: number) => void;
    uploadKey?: string;
  } = {},
): Promise<SurveyDocument> {
  const sessionResponse = await fetch(
    `/api/form-responses/${responseId}/documents/upload-session`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        documentType,
        uploadKey: options.uploadKey,
      }),
    },
  );
  const sessionResult = (await sessionResponse.json()) as {
    data?: { sessionId: string; uploadUrl: string; chunkSize: number };
    document?: SurveyDocument;
    message?: string;
  };
  if (sessionResult.document) return sessionResult.document;
  if (!sessionResponse.ok || !sessionResult.data) {
    throw new Error(
      sessionResult.message ?? "We couldn't start the document upload.",
    );
  }

  await uploadFileDirectlyToDrive(
    sessionResult.data.uploadUrl,
    file,
    sessionResult.data.chunkSize,
    options.onProgress,
  );

  const finalizeResponse = await fetch(
    `/api/form-responses/${responseId}/documents/upload-session/${sessionResult.data.sessionId}/finalize`,
    { method: "POST" },
  );
  const finalizeResult = (await finalizeResponse.json()) as {
    document?: SurveyDocument;
    message?: string;
  };
  if (!finalizeResponse.ok || !finalizeResult.document) {
    throw new Error(
      finalizeResult.message ??
        "The document was uploaded but could not be verified.",
    );
  }
  return finalizeResult.document;
}

async function uploadFileDirectlyToDrive(
  uploadUrl: string,
  file: File,
  chunkSize: number,
  onProgress?: (percentage: number) => void,
) {
  let uploadedBytes = 0;
  let lastProgressAt = 0;
  let lastPercentage = -1;
  const report = (loaded: number) => {
    const percentage = Math.min(100, Math.round((loaded / file.size) * 100));
    const now = Date.now();
    if (
      percentage !== 100 &&
      (percentage === lastPercentage || now - lastProgressAt < 100)
    )
      return;
    lastPercentage = percentage;
    lastProgressAt = now;
    onProgress?.(percentage);
  };

  while (uploadedBytes < file.size) {
    const start = uploadedBytes;
    const endExclusive = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, endExclusive);
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", uploadUrl, true);
      request.setRequestHeader("Content-Type", file.type);
      request.setRequestHeader(
        "Content-Range",
        `bytes ${start}-${endExclusive - 1}/${file.size}`,
      );
      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) report(start + event.loaded);
      });
      request.addEventListener("load", () => {
        const finalChunk = endExclusive === file.size;
        const accepted = finalChunk
          ? request.status === 200 || request.status === 201
          : request.status === 308;
        if (accepted) resolve();
        else
          reject(
            new Error(
              `Google Drive could not accept ${file.name}. Please retry.`,
            ),
          );
      });
      request.addEventListener("error", () => {
        reject(
          new Error(
            navigator.onLine
              ? "The direct Google Drive upload was blocked. Check that this site's origin is allowed, then retry."
              : "Your network connection was lost while uploading the document.",
          ),
        );
      });
      request.addEventListener("abort", () => {
        reject(new Error(`Upload cancelled for ${file.name}.`));
      });
      request.send(chunk);
    });
    uploadedBytes = endExclusive;
    report(uploadedBytes);
  }
}

export async function deleteFormResponseDocument(
  responseId: string,
  documentId: string,
) {
  const response = await fetch(
    `/api/form-responses/${responseId}/documents/${documentId}`,
    { method: "DELETE" },
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message ?? "Failed to delete document.");
}
