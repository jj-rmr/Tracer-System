"use client";

import { useEffect, useState } from "react";
import { Survey, UnemploymentReason } from "@/types/survey";
import { useToast } from "@/components/Toast";
import { Dropdown } from "@/components/Dropdown";
import { useRouter } from "next/navigation";
import { ArrayInput } from "@/components/ArrayInput";
import { PROGRAMS } from "@/types/program";
import { FileInput } from "../FileInput";
import { uploadDocument, deleteDocument } from "@/lib/api/documents";
import { SurveyDocument } from "@/types";

interface Props {
  initialData: Survey;
  isNew: boolean;
  onSuccess?: () => void;
  readOnly?: boolean;
}

export type FormErrors = Partial<Record<keyof Survey, string>>;

export default function SurveyForm({
  initialData,
  isNew,
  onSuccess,
  readOnly = false,
}: Props) {
  const [form, setForm] = useState(initialData);

  useEffect(() => {
    setForm(initialData);
    setExistingDocuments(initialData.documents ?? []);
  }, [initialData]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employmentDocument, setEmploymentDocument] = useState<File | null>(
    null,
  );
  const [awardsDocument, setAwardsDocument] = useState<File | null>(null);
  const [existingDocuments, setExistingDocuments] = useState<SurveyDocument[]>(
    initialData.documents ?? [],
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<SurveyDocument | null>(null);
  const { showToast } = useToast();

  const router = useRouter();

  const sections = [
    "Personal & Contact Info",
    "Education & Graduate Studies",
    "Employment Profile",
    "First Job & Curriculum Evaluation",
  ];

  function updateField<K extends keyof Survey>(field: K, value: Survey[K]) {
    if (readOnly) return;

    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateStep(currentStep: number): boolean {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!form.firstName.trim())
        newErrors.firstName = "Please enter your first name.";
      if (!form.lastName.trim())
        newErrors.lastName = "Please enter your last name.";
      if (!form.barangay.trim())
        newErrors.barangay = "Please enter your barangay.";
      if (!form.municipality.trim())
        newErrors.municipality = "Please enter your municipality or city.";
      if (!form.province.trim())
        newErrors.province = "Please enter your province.";
      if (!form.region.trim()) newErrors.region = "Please select your region.";
      if (!form.civilStatus)
        newErrors.civilStatus = "Please select your civil status.";
      if (!form.sex) newErrors.sex = "Please select your sex.";
      if (
        form.contactNumbers.length === 0 ||
        form.contactNumbers.some((n) => !n.trim())
      ) {
        newErrors.contactNumbers =
          "Please provide at least one valid contact number.";
      }
    }

    if (currentStep === 2) {
      if (!form.program) {
        newErrors.program =
          "Please select the degree program you graduated from.";
      }
      if (!form.yearGraduated) {
        newErrors.yearGraduated = "Please enter your year of graduation.";
      } else if (
        form.yearGraduated < 1900 ||
        form.yearGraduated > new Date().getFullYear()
      ) {
        newErrors.yearGraduated = "Please enter a valid graduation year.";
      }
      if (
        form.advancedStudyDegree === "Others" &&
        !form.advancedStudyOther.trim()
      ) {
        newErrors.advancedStudyOther = "Please specify your graduate degree.";
      }
      if (
        form.advancedStudyReasons === "Others" &&
        !form.advancedStudyReasonOther.trim()
      ) {
        newErrors.advancedStudyReasonOther =
          "Please specify your reason for pursuing graduate studies.";
      }
    }

    if (currentStep === 3) {
      if (!form.employmentStatus)
        newErrors.employmentStatus =
          "Please select your current employment status.";

      if (form.employmentStatus === "Yes") {
        if (!form.currentEmploymentStatus)
          newErrors.currentEmploymentStatus =
            "Please select your present employment status.";
        if (!form.currentOccupation.trim())
          newErrors.currentOccupation = "Please enter your current occupation.";
        if (!form.companyName.trim())
          newErrors.companyName =
            "Please enter your company or employer's name.";
        if (!form.companyAddress.trim())
          newErrors.companyAddress =
            "Please enter your company or employer's address.";
        if (!form.businessIndustry)
          newErrors.businessIndustry =
            "Please select your employer's industry.";
        if (!form.placeOfWork)
          newErrors.placeOfWork =
            "Please select whether you work locally or abroad.";
      } else {
        if (form.unemploymentReasons.length === 0) {
          newErrors.unemploymentReasons =
            "Please select at least one reason for your unemployment.";
        }
        if (
          form.unemploymentReasons.includes("Others") &&
          !form.unemploymentReasonOther.trim()
        ) {
          newErrors.unemploymentReasonOther =
            "Please specify your other reason for unemployment.";
        }
      }
    }

    if (currentStep === 4) {
      if (form.isFirstJob === undefined || form.isFirstJob === null)
        newErrors.isFirstJob =
          "Please indicate whether your current job is your first job.";
      if (
        form.isFirstJobRelated === undefined ||
        form.isFirstJobRelated === null
      )
        newErrors.isFirstJobRelated =
          "Please indicate whether your first job was related to your degree program.";
      if (form.isFirstJob) {
        if (form.stayingReasons.length === 0)
          newErrors.stayingReasons =
            "Please select at least one reason for staying in your first job.";
        if (
          form.stayingReasons.includes("Others") &&
          !form.stayingReasonOther.trim()
        )
          newErrors.stayingReasonOther =
            "Please specify your other reason for staying in your first job.";
      } else {
        if (form.acceptingReasons.length === 0)
          newErrors.acceptingReasons =
            "Please select at least one reason for accepting your first first job.";
        if (
          form.acceptingReasons.includes("Others") &&
          !form.acceptingReasonOther.trim()
        )
          newErrors.acceptingReasonOther =
            "Please specify your other reason for accepting your first first job.";
        if (form.changingReasons.length === 0)
          newErrors.changingReasons =
            "Please select at least one reason for changing jobs";
        if (
          form.changingReasons.includes("Others") &&
          !form.changingReasonOther.trim()
        )
          newErrors.changingReasonOther =
            "Please specify your other reason for changing jobs.";
      }
      if (!form.firstJobTitle.trim())
        newErrors.firstJobTitle = "Please enter the title of your first job.";
      if (!form.firstJobDuration)
        newErrors.firstJobDuration =
          "Please select how long you stayed in your first job.";
      if (
        form.firstJobDuration === "Others" &&
        !form.firstJobDurationOther.trim()
      )
        newErrors.firstJobDurationOther =
          "Please specify the duration of your first job.";
      if (!form.firstJobSource)
        newErrors.firstJobSource =
          "Please select how you found your first job.";
      if (form.firstJobSource === "Others" && !form.firstJobSourceOther.trim())
        newErrors.firstJobSourceOther =
          "Please specify how you found your first job.";
      if (!form.firstJobSearchDuration)
        newErrors.firstJobSearchDuration =
          "Please select how long it took you to find your first job.";
      if (
        form.firstJobSearchDuration === "Others" &&
        !form.firstJobSearchDurationOther.trim()
      )
        newErrors.firstJobSearchDurationOther =
          "Please specify how long it took you to find your first job.";
      if (!form.firstJobLevel)
        newErrors.firstJobLevel = "Please select the level of your first job.";
      if (!form.currentJobLevel)
        newErrors.currentJobLevel = "Please select your current job level.";
      if (!form.initialMonthlyIncome)
        newErrors.initialMonthlyIncome =
          "Please select your initial monthly income range.";
      if (
        form.curriculumRelevant === undefined ||
        form.curriculumRelevant === null
      )
        newErrors.curriculumRelevant =
          "Please indicate whether your curriculum was relevant to your employment.";
      if (form.usefulCompetencies.length === 0)
        newErrors.usefulCompetencies =
          "Please select at least one competency that has been useful in your career.";
      if (
        form.usefulCompetencies.includes("Others") &&
        !form.usefulCompetencyOther.trim()
      )
        newErrors.usefulCompetencyOther =
          "Please specify the other competency you found useful.";
    }
    if (Object.keys(newErrors).length > 0) {
      showToast({
        message: Object.values(newErrors)[0]!,
        type: "error",
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleStep(move: "forward" | "backward") {
    setStep((prev) => (move === "forward" ? prev + 1 : prev - 1));

    window.dispatchEvent(new Event("stepchanged"));
  }

  async function handleDeleteDocument(document: SurveyDocument) {
    if (readOnly) return;

    try {
      setIsSubmitting(true);

      await deleteDocument(document.id);

      setExistingDocuments((prev) =>
        prev.filter((item) => item.id !== document.id),
      );

      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((item) => item.id !== document.id),
      }));

      showToast({
        message: "Document deleted successfully.",
        type: "success",
      });

      setDocumentToDelete(null);
    } catch (error) {
      console.error("Failed to delete document:", error);

      showToast({
        message: "Failed to delete document.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestDeleteDocument(document: SurveyDocument) {
    if (readOnly) return;

    setDocumentToDelete(document);
  }

  // async function save() {
  //   console.log("save() called");

  //   const valid = validateStep(4);
  //   console.log("validateStep(4):", valid);

  //   if (!valid) {
  //     console.log("Errors:", errors);
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     console.log("Sending request...");

  //     const { id: _, userId: __, ...surveyData } = form;

  //     const response = await fetch("/api/alumni/survey", {
  //       method: isNew ? "POST" : "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(surveyData),
  //     });

  //     console.log("Response:", response.status);

  //     const data = await response.json();
  //     console.log(data);

  //     onSuccess?.();
  //     setShowSaveModal(false);
  //     router.refresh();
  //     showToast({
  //       message: isNew
  //         ? "Form saved successfully"
  //         : "Changes saved successfully!",
  //       type: "success",
  //     });
  //   } catch (err: any) {
  //     showToast({
  //       message: isNew
  //         ? "An error occurred while creating a form"
  //         : "An error occurred while saving changes",
  //       type: "error",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  async function save() {
    console.log("save() called");

    const valid = validateStep(4);
    console.log("validateStep(4):", valid);

    if (!valid) {
      console.log("Errors:", errors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Sending survey request...");

      const { id: _, userId: __, ...surveyData } = form;

      // 1. Save the survey first
      const response = await fetch("/api/alumni/survey", {
        method: isNew ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        throw new Error("Failed to save survey");
      }

      const result = await response.json();

      if (!result.success || !result.survey) {
        throw new Error("Survey was not saved correctly");
      }

      const savedSurvey: Survey = result.survey;

      const uploadFiles = [
        {
          type: "employment",
          file: employmentDocument,
        },
        {
          type: "awards",
          file: awardsDocument,
        },
      ].filter(
        (
          item,
        ): item is {
          type: "employment" | "awards";
          file: File;
        } => item.file !== null,
      );

      const uploadResults = await Promise.allSettled(
        uploadFiles.map((item) => uploadDocument(item.file, savedSurvey.id)),
      );

      const successfulUploads = uploadResults
        .filter(
          (result): result is PromiseFulfilledResult<SurveyDocument> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      const failedUploads = uploadResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        )
        .map((result) =>
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown upload error",
        );

      const hasUploadFailure = failedUploads.length > 0;

      if (successfulUploads.length > 0) {
        setExistingDocuments((prev) => [...successfulUploads, ...prev]);

        setForm((prev) => ({
          ...prev,
          documents: [...successfulUploads, ...(prev.documents ?? [])],
        }));
      }

      uploadResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const uploadedFile = uploadFiles[index];

          if (uploadedFile.type === "employment") {
            setEmploymentDocument(null);
          }

          if (uploadedFile.type === "awards") {
            setAwardsDocument(null);
          }
        }
      });

      showToast({
        message: hasUploadFailure
          ? `Survey saved, but some documents could not be uploaded: ${failedUploads.join(", ")}`
          : isNew
            ? "Form saved successfully"
            : "Changes saved successfully!",
        type: hasUploadFailure ? "error" : "success",
      });

      onSuccess?.();
      setShowSaveModal(false);
      router.refresh();
    } catch (err: any) {
      console.error("Save failed:", err);

      showToast({
        message: isNew
          ? "An error occurred while creating a form"
          : "An error occurred while saving changes",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePreSubmitCheck = () => {
    if (validateStep(4)) {
      setShowSaveModal(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 md:border border-slate-200 rounded-2xl md:p-4">
        <div className="flex justify-between text-sm font-medium text-slate-700">
          <span>
            Step {step} of {sections.length}
          </span>
          <span className="text-sky-600 font-semibold">
            {sections[step - 1]}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${(step / sections.length) * 100}%` }}
          />
        </div>
      </div>
      {/* Render Steps */}
      <div className="min-h-100 bg-white md:border border-slate-200 rounded-2xl md:p-6 shadow-sm">
        {step === 1 && (
          <PersonalInfoStep
            form={form}
            errors={errors}
            readOnly={readOnly}
            updateField={updateField}
          />
        )}
        {step === 2 && (
          <EducationStep
            form={form}
            errors={errors}
            readOnly={readOnly}
            updateField={updateField}
          />
        )}
        {step === 3 && (
          <EmploymentStep
            form={form}
            errors={errors}
            readOnly={readOnly}
            updateField={updateField}
            employmentDocument={employmentDocument}
            setEmploymentDocument={setEmploymentDocument}
            awardsDocument={awardsDocument}
            setAwardsDocument={setAwardsDocument}
            existingDocuments={existingDocuments}
            onRequestDeleteDocument={requestDeleteDocument}
          />
        )}
        {step === 4 && (
          <JobHistoryStep
            form={form}
            errors={errors}
            readOnly={readOnly}
            updateField={updateField}
          />
        )}
      </div>
      {/* Buttons */}
      <div className="flex flex-col-reverse md:flex-row justify-stretch md:justify-end gap-4">
        {step > 1 && (
          <button
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 whitespace-nowrap text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-100"
            onClick={() => handleStep("backward")}
          >
            Previous Section
          </button>
        )}

        {!readOnly ? (
          step === sections.length ? (
            <button
              className="rounded-2xl bg-sky-600 px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-slate-300"
              onClick={handlePreSubmitCheck}
            >
              {isNew ? "Submit Survey" : "Update Survey"}
            </button>
          ) : (
            <button
              className="rounded-2xl bg-sky-600 px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-slate-300"
              onClick={() => validateStep(step) && handleStep("forward")}
            >
              Next Section
            </button>
          )
        ) : (
          step < sections.length && (
            <button
              className="rounded-2xl bg-sky-600 px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-slate-300"
              onClick={() => handleStep("forward")}
            >
              Next Section
            </button>
          )
        )}
      </div>
      {!readOnly && showSaveModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {isNew ? "Submit Survey?" : "Save Changes?"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isNew
                ? "Are you sure you want to submit? You can update your answers later."
                : "Are you sure you want to save these changes to your survey?"}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Review Form
              </button>
              <button
                type="button"
                onClick={save}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors"
              >
                {isSubmitting
                  ? isNew
                    ? "Creating Survey..."
                    : "Updating Survey..."
                  : readOnly
                    ? "Close"
                    : isNew
                      ? "Submit Survey"
                      : "Update Survey"}
              </button>
            </div>
          </div>
        </div>
      )}
      {!readOnly && documentToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Delete Document?
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                "{documentToDelete.filename}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteDocument(documentToDelete)}
                disabled={isSubmitting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "Deleting..." : "Delete Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StepProps {
  form: Survey;
  errors: FormErrors;
  readOnly: boolean;
  updateField: <K extends keyof Survey>(field: K, value: Survey[K]) => void;
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-500">{message}</p>;
}

const styles = {
  input: (err: boolean, disabled: boolean) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 shadow-none placeholder:opacity-0"
      : "focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm text-slate-900";

    return `w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition duration-200 placeholder:text-slate-400 ${stateClass} ${err && !disabled ? "border-rose-400 focus:ring-rose-100" : ""}`;
  },
  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600",
};

function PersonalInfoStep({ form, errors, updateField, readOnly }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">
        Personal & Contact Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className={styles.label}>First Name *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.firstName, readOnly)}
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          <ErrorMessage message={errors.firstName} />
        </div>
        <div>
          <label className={styles.label}>Middle Name</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(false, readOnly)}
            value={form.middleName}
            onChange={(e) => updateField("middleName", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>Last Name *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.lastName, readOnly)}
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
          <ErrorMessage message={errors.lastName} />
        </div>
        <div>
          <label className={styles.label}>Extension Name</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(false, readOnly)}
            placeholder="e.g. Jr., III"
            value={form.extensionName}
            onChange={(e) => updateField("extensionName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={styles.label}>Street</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(false, readOnly)}
            value={form.street}
            onChange={(e) => updateField("street", e.target.value)}
          />
          <ErrorMessage message={errors.street} />
        </div>
        <div>
          <label className={styles.label}>Barangay *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.barangay, readOnly)}
            value={form.barangay}
            onChange={(e) => updateField("barangay", e.target.value)}
          />
          <ErrorMessage message={errors.barangay} />
        </div>
        <div>
          <label className={styles.label}>Municipality *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.municipality, readOnly)}
            value={form.municipality}
            onChange={(e) => updateField("municipality", e.target.value)}
          />
          <ErrorMessage message={errors.municipality} />
        </div>
        <div>
          <label className={styles.label}>Province *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.province, readOnly)}
            value={form.province}
            onChange={(e) => updateField("province", e.target.value)}
          />
          <ErrorMessage message={errors.province} />
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="region"
            label="Region *"
            value={form.region}
            onChange={(val) => updateField("region", val as any)}
            options={[
              { value: "NCR", label: "National Capital Region (NCR)" },
              { value: "CAR", label: "Cordillera Administrative Region (CAR)" },
              { value: "Region I", label: "Region I (Ilocos Region)" },
              { value: "Region II", label: "Region II (Cagayan Valley)" },
              { value: "Region III", label: "Region III (Central Luzon)" },
              { value: "Region IV-A", label: "Region IV-A (CALABARZON)" },
              { value: "MIMAROPA", label: "MIMAROPA Region" },
              { value: "Region V", label: "Region V (Bicol Region)" },
              { value: "Region VI", label: "Region VI (Western Visayas)" },
              { value: "Region VII", label: "Region VII (Central Visayas)" },
              { value: "Region VIII", label: "Region VIII (Eastern Visayas)" },
              { value: "Region IX", label: "Region IX (Zamboanga Peninsula)" },
              { value: "Region X", label: "Region X (Northern Mindanao)" },
              { value: "Region XI", label: "Region XI (Davao Region)" },
              { value: "Region XII", label: "Region XII (SOCCSKSARGEN)" },
              { value: "Region XIII", label: "Region XIII (Caraga)" },
              {
                value: "BARMM",
                label:
                  "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
              },
            ]}
            placeholder="Select Region"
            required
            hasError={!!errors.region}
          />
          <ErrorMessage message={errors.region} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Dropdown
            disabled={readOnly}
            id="civilStatus"
            label="Civil Status *"
            value={form.civilStatus}
            onChange={(val) => updateField("civilStatus", val as any)}
            options={[
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
              { value: "Separated/Divorced", label: "Separated/Divorced" },
              { value: "Solo Parent", label: "Solo Parent" },
              { value: "Widow or Widower", label: "Widow or Widower" },
            ]}
            placeholder="Select"
            required
            hasError={!!errors.civilStatus}
          />
          <ErrorMessage message={errors.civilStatus} />
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="sex"
            label="Sex *"
            value={form.sex}
            onChange={(val) => updateField("sex", val as any)}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
            placeholder="Select"
            required
            hasError={!!errors.sex}
          />
          <ErrorMessage message={errors.sex} />
        </div>
      </div>

      <div className="space-y-3">
        <ArrayInput
          value={form.contactNumbers}
          onChange={(items) => updateField("contactNumbers", items)}
          label="Contact Numbers"
          fieldName="contactNumbers"
          addButtonLabel="Add Contact Number"
          placeholder="09XXXXXXXXX"
          required
          readOnly={readOnly}
          hasError={!!errors.contactNumbers}
        />
        <ErrorMessage message={errors.contactNumbers} />
      </div>
    </div>
  );
}

function EducationStep({ form, errors, updateField, readOnly }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Academic Background</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
        <div>
          <Dropdown
            id="program"
            disabled={readOnly}
            label="Program *"
            value={form.program}
            onChange={(value) => updateField("program", value)}
            options={PROGRAMS}
            hasError={!!errors.program}
            required
          />
          <ErrorMessage message={errors.program} />
        </div>

        <div>
          <label className={styles.label}>Year Graduated *</label>
          <input
            disabled={readOnly}
            type="number"
            className={styles.input(!!errors.yearGraduated, readOnly)}
            value={form.yearGraduated}
            onChange={(e) => {
              const value = e.target.value;

              updateField("yearGraduated", value === "" ? 0 : Number(value));
            }}
          />
          <ErrorMessage message={errors.yearGraduated} />
        </div>
      </div>

      <ArrayInput
        value={form.honors}
        onChange={(items) => updateField("honors", items)}
        label="Academic Honors / Awards Received"
        fieldName="honors"
        addButtonLabel="Add Honor / Award"
        placeholder="e.g. Cum Laude"
        readOnly={readOnly}
      />

      <ArrayInput
        value={form.trainings}
        onChange={(items) => updateField("trainings", items)}
        label="Professional Trainings Attended"
        fieldName="trainings"
        addButtonLabel="Add Training"
        placeholder="e.g. Web Development Bootcamp"
        readOnly={readOnly}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div>
          <Dropdown
            disabled={readOnly}
            id="advancedStudyDegree"
            label="Advanced Graduate Studies Degree"
            value={form.advancedStudyDegree}
            onChange={(val) => updateField("advancedStudyDegree", val as any)}
            options={[
              { value: "", label: "None" },
              { value: "MS", label: "MS" },
              { value: "MA", label: "MA" },
              { value: "Others", label: "Others" },
            ]}
            placeholder="None"
            hasError={false}
          />
        </div>
        {form.advancedStudyDegree && (
          <div>
            <Dropdown
              disabled={readOnly}
              id="advancedStudyReasons"
              label="Reason for Pursuing Graduate Studies"
              value={form.advancedStudyReasons}
              onChange={(val) =>
                updateField("advancedStudyReasons", val as any)
              }
              options={[
                { value: "For Promotion", label: "For Promotion" },
                {
                  value: "Professional Development",
                  label: "Professional Development",
                },
                { value: "Others", label: "Others" },
              ]}
              placeholder="None"
              hasError={false}
            />
          </div>
        )}
      </div>

      {form.advancedStudyDegree === "Others" && (
        <div>
          <label className={styles.label}>Specify Advanced Degree *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.advancedStudyOther, readOnly)}
            value={form.advancedStudyOther}
            onChange={(e) => updateField("advancedStudyOther", e.target.value)}
          />
          <ErrorMessage message={errors.advancedStudyOther} />
        </div>
      )}

      {form.advancedStudyReasons === "Others" && (
        <div>
          <label className={styles.label}>Specify Reason *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(
              !!errors.advancedStudyReasonOther,
              readOnly,
            )}
            value={form.advancedStudyReasonOther}
            onChange={(e) =>
              updateField("advancedStudyReasonOther", e.target.value)
            }
          />
          <ErrorMessage message={errors.advancedStudyReasonOther} />
        </div>
      )}
    </div>
  );
}

function EmploymentStep({
  form,
  errors,
  updateField,
  readOnly,
  employmentDocument,
  setEmploymentDocument,
  awardsDocument,
  setAwardsDocument,
  existingDocuments,
  onRequestDeleteDocument,
}: StepProps & {
  employmentDocument: File | null;
  setEmploymentDocument: (file: File | null) => void;

  awardsDocument: File | null;
  setAwardsDocument: (file: File | null) => void;

  existingDocuments: SurveyDocument[];
  onRequestDeleteDocument: (document: SurveyDocument) => void;
}) {
  const unempOptions: {
    value: UnemploymentReason;
    label: string;
  }[] = [
    {
      value: "Advance Study",
      label: "Advance or further study",
    },
    {
      value: "Family Concern",
      label: "Family concern and decided not to find a job",
    },
    {
      value: "Health",
      label: "Health-related reason(s)",
    },
    {
      value: "Lack of Work Experience",
      label: "Lack of work experience",
    },
    {
      value: "No Job Opportunity",
      label: "No job opportunity",
    },
    {
      value: "Did Not Look For Job",
      label: "Did not look for a job",
    },
    {
      value: "Others",
      label: "Others",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Employment Profile</h3>

      <Dropdown
        disabled={readOnly}
        id="employmentStatus"
        label="Employment Status *"
        value={form.employmentStatus}
        onChange={(val) => updateField("employmentStatus", val as any)}
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
          { value: "Never Employed", label: "Never Employed" },
        ]}
        placeholder="Select"
        required
        hasError={!!errors.employmentStatus}
      />

      {form.employmentStatus === "Yes" && (
        <div className="space-y-6 border-t pt-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              disabled={readOnly}
              id="currentEmploymentStatus"
              label="Present Employment Status *"
              value={form.currentEmploymentStatus}
              onChange={(val) =>
                updateField("currentEmploymentStatus", val as any)
              }
              options={[
                { value: "Regular/Permanent", label: "Regular/Permanent" },
                { value: "Temporary", label: "Temporary" },
                { value: "Casual", label: "Casual" },
                { value: "Contractual", label: "Contractual" },
                { value: "COS/JO", label: "COS/JO" },
                { value: "Self-employed", label: "Self-employed" },
                { value: "Open Contract", label: "Open Contract" },
              ]}
              placeholder="Select"
              required
              hasError={!!errors.currentEmploymentStatus}
            />
            <div>
              <label className={styles.label}>Present Occupation *</label>
              <input
                disabled={readOnly}
                type="text"
                className={styles.input(!!errors.currentOccupation, readOnly)}
                value={form.currentOccupation}
                onChange={(e) =>
                  updateField("currentOccupation", e.target.value)
                }
              />
              <ErrorMessage message={errors.currentOccupation} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={styles.label}>Company Name *</label>
              <input
                disabled={readOnly}
                type="text"
                className={styles.input(!!errors.companyName, readOnly)}
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />
              <ErrorMessage message={errors.companyName} />
            </div>
            <div>
              <label className={styles.label}>Company Address *</label>
              <input
                disabled={readOnly}
                type="text"
                className={styles.input(!!errors.companyAddress, readOnly)}
                value={form.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
              />
              <ErrorMessage message={errors.companyAddress} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              disabled={readOnly}
              id="businessIndustry"
              label="Business Industry *"
              value={form.businessIndustry}
              onChange={(val) => updateField("businessIndustry", val as any)}
              options={[
                { value: "Agriculture", label: "Agriculture" },
                { value: "Fishing", label: "Fishing" },
                { value: "Mining", label: "Mining" },
                { value: "Manufacturing", label: "Manufacturing" },
                { value: "Electricity", label: "Electricity" },
                { value: "Construction", label: "Construction" },
                { value: "Wholesale/Retail", label: "Wholesale/Retail" },
                { value: "Food and Beverage", label: "Food and Beverage" },
                { value: "Lodging", label: "Lodging" },
                { value: "Financial", label: "Financial" },
                { value: "Real Estate", label: "Real Estate" },
                {
                  value: "Public Administration",
                  label: "Public Administration",
                },
                { value: "Education", label: "Education" },
                { value: "Health", label: "Health" },
                { value: "Private Household", label: "Private Household" },
                { value: "Recreation", label: "Recreation" },
                { value: "Travel and Tourism", label: "Travel and Tourism" },
                { value: "Meeting and Events", label: "Meeting and Events" },
              ]}
              placeholder="Select"
              required
              hasError={!!errors.businessIndustry}
            />
            <Dropdown
              disabled={readOnly}
              id="placeOfWork"
              label="Place of Work *"
              value={form.placeOfWork}
              onChange={(val) => updateField("placeOfWork", val as any)}
              options={[
                { value: "Local", label: "Local" },
                { value: "Abroad", label: "Abroad" },
              ]}
              placeholder="Select"
              required
              hasError={!!errors.placeOfWork}
            />
          </div>
          <FileInput
            id="employmentDocuments"
            name="employmentDocuments"
            label="Employment Documents"
            file={employmentDocument}
            onChange={setEmploymentDocument}
            accept=".pdf,.doc,.docx"
            hint="Upload your resume or other employment-related documents."
            disabled={readOnly}
          />
          <FileInput
            id="awardsDocuments"
            name="awardsDocuments"
            label="Awards Documents"
            file={awardsDocument}
            onChange={setAwardsDocument}
            accept=".pdf,.doc,.docx"
            hint="Upload certificates or documents related to your awards."
            disabled={readOnly}
          />
        </div>
      )}

      <div className="space-y-4 border-t border-slate-200 pt-4">
        {(form.employmentStatus === "No" ||
          form.employmentStatus === "Never Employed") && (
          <div className="space-y-2 border-t pt-4">
            <label className={styles.label}>
              Please state the reason(s) why you are not yet employed. You may
              check more than one answer. *
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {unempOptions.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    disabled={readOnly}
                    type="checkbox"
                    checked={form.unemploymentReasons.includes(reason.value)}
                    onChange={() =>
                      updateField(
                        "unemploymentReasons",
                        form.unemploymentReasons.includes(reason.value)
                          ? form.unemploymentReasons.filter(
                              (r) => r !== reason.value,
                            )
                          : [...form.unemploymentReasons, reason.value],
                      )
                    }
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            <ErrorMessage message={errors.unemploymentReasons} />

            {form.unemploymentReasons.includes("Others") && (
              <input
                disabled={readOnly}
                type="text"
                className={styles.input(
                  !!errors.unemploymentReasonOther,
                  readOnly,
                )}
                placeholder="Please specify other reason(s)"
                value={form.unemploymentReasonOther}
                onChange={(e) =>
                  updateField("unemploymentReasonOther", e.target.value)
                }
              />
            )}
          </div>
        )}

        {existingDocuments.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Uploaded documents
            </p>

            <ul className="mt-2 space-y-2">
              {existingDocuments.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <span className="min-w-0 truncate">{document.filename}</span>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onRequestDeleteDocument(document)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function JobHistoryStep({ form, errors, updateField, readOnly }: StepProps) {
  const durations = [
    "Less than a month",
    "1-6 months",
    "7-11 months",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "Others",
  ];
  const sources = [
    "Advertisement",
    "Walk-in",
    "Recommended",
    "Friends",
    "School Placement",
    "Family Business",
    "Job Fair/PESO",
    "Others",
  ];
  const incomes = [
    "Below 5000",
    "5000-9999",
    "10000-14999",
    "15000-19999",
    "20000-24999",
    "25000 Above",
  ];
  const levels = [
    "Rank/Clerical",
    "Professional/Technical/Supervisory",
    "Managerial/Executive",
    "Self-employed",
  ];
  const reasonsList = [
    "Salary and Benefits",
    "Career Challenge",
    "Special Skill",
    "Related to Course",
    "Proximity to Residence",
    "Peer Influence",
    "Family Influence",
    "Others",
  ];
  const compList = [
    "Communication Skills",
    "Human Relation Skills",
    "Entrepreneurial Skills",
    "Problem Solving Skills",
    "Critical Thinking Skills",
    "Others",
  ];

  const toggleList = (
    field:
      | "stayingReasons"
      | "acceptingReasons"
      | "changingReasons"
      | "usefulCompetencies",
    val: any,
  ) => {
    const list = [...form[field]] as any[];
    const idx = list.indexOf(val);
    if (idx > -1) list.splice(idx, 1);
    else list.push(val);
    updateField(field, list);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">
        First Job & Curriculum Feedback
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Dropdown
          disabled={readOnly}
          id="isFirstJob"
          label="Is your current job your first job? *"
          value={
            form.isFirstJob === true
              ? "true"
              : form.isFirstJob === false
                ? "false"
                : ""
          }
          onChange={(val) => updateField("isFirstJob", val === "true")}
          options={[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Select"
          required
          hasError={!!errors.isFirstJob}
        />
        <Dropdown
          disabled={readOnly}
          id="isFirstJobRelated"
          label="Is your first job related to your college course? *"
          value={
            form.isFirstJobRelated === true
              ? "true"
              : form.isFirstJobRelated === false
                ? "false"
                : ""
          }
          onChange={(val) => updateField("isFirstJobRelated", val === "true")}
          options={[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Select"
          required
          hasError={!!errors.isFirstJobRelated}
        />
      </div>

      {form.isFirstJob === true && (
        <div className="space-y-2 border-t pt-4">
          <label className={styles.label}>
            Reasons for staying in your first job *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reasonsList.map((r) => (
              <label key={r} className="flex items-center space-x-2 text-sm">
                <input
                  disabled={readOnly}
                  type="checkbox"
                  checked={form.stayingReasons.includes(r as any)}
                  onChange={() => toggleList("stayingReasons", r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
          <ErrorMessage message={errors.stayingReasons} />
          {form.stayingReasons.includes("Others") && (
            <input
              disabled={readOnly}
              type="text"
              className={styles.input(!!errors.stayingReasonOther, readOnly)}
              placeholder="Specify other reasons"
              value={form.stayingReasonOther}
              onChange={(e) =>
                updateField("stayingReasonOther", e.target.value)
              }
            />
          )}
        </div>
      )}

      {form.isFirstJob === false && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className={styles.label}>
              Reasons for accepting first job *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reasonsList
                .filter(
                  (r) =>
                    ![
                      "Related to Course",
                      "Peer Influence",
                      "Family Influence",
                    ].includes(r),
                )
                .map((r) => (
                  <label
                    key={r}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      disabled={readOnly}
                      type="checkbox"
                      checked={form.acceptingReasons.includes(r as any)}
                      onChange={() => toggleList("acceptingReasons", r)}
                    />
                    <span>{r}</span>
                  </label>
                ))}
            </div>
            <ErrorMessage message={errors.acceptingReasons} />
            {form.acceptingReasons.includes("Others") && (
              <input
                disabled={readOnly}
                type="text"
                className={styles.input(
                  !!errors.acceptingReasonOther,
                  readOnly,
                )}
                placeholder="Specify other"
                value={form.acceptingReasonOther}
                onChange={(e) =>
                  updateField("acceptingReasonOther", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <label className={styles.label}>
              Reasons for changing your job *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {reasonsList
                .filter(
                  (r) =>
                    ![
                      "Related to Course",
                      "Peer Influence",
                      "Family Influence",
                    ].includes(r),
                )
                .map((r) => (
                  <label
                    key={r}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      disabled={readOnly}
                      type="checkbox"
                      checked={form.changingReasons.includes(r as any)}
                      onChange={() => toggleList("changingReasons", r)}
                    />
                    <span>{r}</span>
                  </label>
                ))}
            </div>
            <ErrorMessage message={errors.changingReasons} />
            {form.changingReasons.includes("Others") && (
              <input
                disabled={readOnly}
                type="text"
                className={styles.input(!!errors.changingReasonOther, readOnly)}
                placeholder="Specify other"
                value={form.changingReasonOther}
                onChange={(e) =>
                  updateField("changingReasonOther", e.target.value)
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Standard Fields block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
        <div>
          <label className={styles.label}>First Job Title *</label>
          <input
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.firstJobTitle, readOnly)}
            value={form.firstJobTitle}
            onChange={(e) => updateField("firstJobTitle", e.target.value)}
          />
          <ErrorMessage message={errors.firstJobTitle} />
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="firstJobSearchDuration"
            label="First Job Search Duration *"
            value={form.firstJobSearchDuration}
            onChange={(val) =>
              updateField("firstJobSearchDuration", val as any)
            }
            options={durations.map((d) => ({
              value: d,
              label: d,
            }))}
            placeholder="Select"
            required
            hasError={!!errors.firstJobSearchDuration}
          />
          <ErrorMessage message={errors.firstJobSearchDuration} />

          {form.firstJobSearchDuration === "Others" && (
            <>
              <input
                disabled={readOnly}
                type="text"
                className={`${styles.input(
                  !!errors.firstJobSearchDurationOther,
                  readOnly,
                )} mt-2`}
                value={form.firstJobSearchDurationOther}
                onChange={(e) =>
                  updateField("firstJobSearchDurationOther", e.target.value)
                }
              />
              <ErrorMessage message={errors.firstJobSearchDurationOther} />
            </>
          )}
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="firstJobDuration"
            label="First Job Duration *"
            value={form.firstJobDuration}
            onChange={(val) => updateField("firstJobDuration", val as any)}
            options={durations.map((d) => ({
              value: d,
              label: d,
            }))}
            placeholder="Select"
            required
            hasError={!!errors.firstJobDuration}
          />
          <ErrorMessage message={errors.firstJobDuration} />

          {form.firstJobDuration === "Others" && (
            <>
              <input
                disabled={readOnly}
                type="text"
                className={`${styles.input(!!errors.firstJobDurationOther, readOnly)} mt-2`}
                value={form.firstJobDurationOther}
                onChange={(e) =>
                  updateField("firstJobDurationOther", e.target.value)
                }
              />
              <ErrorMessage message={errors.firstJobDurationOther} />
            </>
          )}
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="firstJobSource"
            label="First Job Source *"
            value={form.firstJobSource}
            onChange={(val) => updateField("firstJobSource", val as any)}
            options={sources.map((s) => ({
              value: s,
              label: s,
            }))}
            placeholder="Select"
            required
            hasError={!!errors.firstJobSource}
          />
          <ErrorMessage message={errors.firstJobSource} />

          {form.firstJobSource === "Others" && (
            <>
              <input
                disabled={readOnly}
                type="text"
                className={`${styles.input(!!errors.firstJobSourceOther, readOnly)} mt-2`}
                value={form.firstJobSourceOther}
                onChange={(e) =>
                  updateField("firstJobSourceOther", e.target.value)
                }
              />
              <ErrorMessage message={errors.firstJobSourceOther} />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Dropdown
            disabled={readOnly}
            id="firstJobLevel"
            label="First Job Level *"
            value={form.firstJobLevel}
            onChange={(val) => updateField("firstJobLevel", val as any)}
            options={levels.map((l) => ({
              value: l,
              label: l,
            }))}
            placeholder="Select"
            required
            hasError={!!errors.firstJobLevel}
          />
          <ErrorMessage message={errors.firstJobLevel} />
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="currentJobLevel"
            label="Current Job Level *"
            value={form.currentJobLevel}
            onChange={(val) => updateField("currentJobLevel", val as any)}
            options={levels.map((l) => ({
              value: l,
              label: l,
            }))}
            placeholder="Select"
            required
            hasError={!!errors.currentJobLevel}
          />
          <ErrorMessage message={errors.currentJobLevel} />
        </div>
        <div>
          <Dropdown
            disabled={readOnly}
            id="initialMonthlyIncome"
            label="Initial Monthly Income *"
            value={form.initialMonthlyIncome}
            onChange={(val) => updateField("initialMonthlyIncome", val as any)}
            options={incomes.map((l) => ({
              value: l,
              label: l,
            }))}
            placeholder="Select"
            required
            hasError={!!errors.initialMonthlyIncome}
          />
          <ErrorMessage message={errors.initialMonthlyIncome} />
        </div>
      </div>
      <div className="space-y-4 border-t pt-4">
        <Dropdown
          disabled={readOnly}
          id="curriculumRelevant"
          label="Was the curriculum relevant to your employment? *"
          value={
            form.curriculumRelevant === true
              ? "true"
              : form.curriculumRelevant === false
                ? "false"
                : ""
          }
          onChange={(val) => updateField("curriculumRelevant", val === "true")}
          options={[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          placeholder="Select"
          required
          hasError={!!errors.curriculumRelevant}
        />

        <div>
          <label className={styles.label}>
            Useful Competencies Learned in College *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {compList.map((c) => (
              <label key={c} className="flex items-center space-x-2 text-sm">
                <input
                  disabled={readOnly}
                  type="checkbox"
                  checked={form.usefulCompetencies.includes(c as any)}
                  onChange={() => toggleList("usefulCompetencies", c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <ErrorMessage message={errors.usefulCompetencies} />
          {form.usefulCompetencies.includes("Others") && (
            <input
              disabled={readOnly}
              type="text"
              className={`${styles.input(!!errors.usefulCompetencyOther, readOnly)} mt-2`}
              placeholder="Specify other competencies"
              value={form.usefulCompetencyOther}
              onChange={(e) =>
                updateField("usefulCompetencyOther", e.target.value)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
