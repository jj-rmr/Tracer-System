export async function submitFormA(form: HTMLFormElement) {
  const formData = new FormData(form);
  formData.append("formName", "FormA");

  const response = await fetch(form.action || "/api/forms/form-a", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Submission failed");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const downloadName = decodeURIComponent(filenameMatch?.[1] || "downloaded-file");
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}
