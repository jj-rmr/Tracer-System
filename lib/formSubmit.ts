/**
 * Generalized form submission handler that works for all forms
 * @param form - The form element to submit
 * @param formName - The name of the form (e.g., "FormA", "FormB", "FormC")
 */
export async function submitForm(form: HTMLFormElement, formName: string) {
  const formData = new FormData(form);
  formData.append("formName", formName);

  const response = await fetch(form.action || "/api/forms", {
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

/**
 * Form A specific submission handler (uses generalized submitForm)
 * @deprecated Use submitForm(form, "FormA") instead
 */
export async function submitFormA(form: HTMLFormElement) {
  return submitForm(form, "FormA");
}
