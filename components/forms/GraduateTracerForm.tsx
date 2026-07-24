"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { EducationSection } from "@/components/forms/graduate-tracer/EducationSection";
import { EmploymentSection } from "@/components/forms/graduate-tracer/EmploymentSection";
import { JobHistorySection } from "@/components/forms/graduate-tracer/JobHistorySection";
import { PersonalInfoSection } from "@/components/forms/graduate-tracer/PersonalInfoSection";
import { useToast } from "@/components/ui/Toast";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  type GraduateTracerFieldErrors,
  validateGraduateTracerStep,
} from "@/lib/forms/graduate-tracer-validation";
import type { Survey, SurveyDocument } from "@/types";

interface Props {
  initialData: Survey;
  isNew: boolean;
  onSuccess?: () => void;
  onSave?: (survey: Survey, documents: PendingSurveyDocuments) => Promise<void>;
  onDeleteDocument?: (document: SurveyDocument) => Promise<void>;
  readOnly?: boolean;
  allowDocuments?: boolean;
  requireResponses?: boolean;
  submitLabel?: string;
}

export interface PendingSurveyDocuments {
  employment: File[];
  awards: File[];
}

export type FormErrors = GraduateTracerFieldErrors;

export default function GraduateTracerForm({
  initialData,
  isNew,
  onSuccess,
  onSave,
  onDeleteDocument,
  readOnly = false,
  allowDocuments = true,
  requireResponses = true,
  submitLabel,
}: Props) {
  const { control, getValues, register, reset, setValue } = useForm<Survey>({
    defaultValues: initialData,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employmentDocuments, setEmploymentDocuments] = useState<File[]>([]);

  const [awardsDocuments, setAwardsDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<SurveyDocument[]>(
    initialData.documents ?? [],
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<SurveyDocument | null>(null);
  const { showToast } = useToast();

  const router = useRouter();

  useEffect(() => {
    reset(initialData);
    setExistingDocuments(initialData.documents ?? []);
  }, [initialData, reset]);

  const sections = [
    "Personal & Contact Info",
    "Education & Graduate Studies",
    "Employment Profile",
    "First Job & Curriculum Evaluation",
  ];

  function clearFieldError(field: keyof Survey) {
    if (!errors[field]) return;

    setErrors((previousErrors) => {
      const nextErrors = { ...previousErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function getStepErrors(currentStep: number): FormErrors {
    return validateGraduateTracerStep(getValues(), currentStep);
  }

  function validateSteps(stepsToValidate: number[]): boolean {
    if (!requireResponses) {
      setErrors({});
      return true;
    }

    const errorsByStep = stepsToValidate.map((currentStep) => ({
      currentStep,
      errors: getStepErrors(currentStep),
    }));
    const newErrors = Object.assign(
      {},
      ...errorsByStep.map(({ errors: stepErrors }) => stepErrors),
    ) as FormErrors;

    if (Object.keys(newErrors).length > 0) {
      showToast({
        message: Object.values(newErrors)[0]!,
        type: "error",
      });

      const firstInvalidStep = errorsByStep.find(
        ({ errors: stepErrors }) => Object.keys(stepErrors).length > 0,
      )?.currentStep;

      if (firstInvalidStep && firstInvalidStep !== step) {
        setStep(firstInvalidStep);
        window.dispatchEvent(new Event("stepchanged"));
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep(currentStep: number): boolean {
    return validateSteps([currentStep]);
  }

  function handleStep(move: "forward" | "backward") {
    setStep((prev) => (move === "forward" ? prev + 1 : prev - 1));

    window.dispatchEvent(new Event("stepchanged"));
  }

  async function handleDeleteDocument(document: SurveyDocument) {
    if (readOnly) return;

    try {
      setIsSubmitting(true);

      if (!onDeleteDocument) {
        throw new Error(
          "Document deletion is not configured for this response.",
        );
      }
      await onDeleteDocument(document);

      setExistingDocuments((prev) =>
        prev.filter((item) => item.id !== document.id),
      );

      setValue(
        "documents",
        getValues("documents").filter((item) => item.id !== document.id),
        { shouldDirty: true },
      );

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

  async function save() {
    const valid = validateSteps([1, 2, 3, 4]);

    if (!valid) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!onSave) throw new Error("Response saving is not configured.");

      await onSave(getValues(), {
        employment: employmentDocuments,
        awards: awardsDocuments,
      });

      showToast({
        message: requireResponses
          ? "Response saved successfully."
          : "Response added successfully.",
        type: "success",
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
    if (validateSteps([1, 2, 3, 4])) {
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
      <div className="min-h-100 bg-white md:border border-slate-200 rounded-2xl md:p-6 md:shadow-sm">
        {step === 1 && (
          <PersonalInfoSection
            control={control}
            errors={errors}
            readOnly={readOnly}
            register={register}
            clearFieldError={clearFieldError}
          />
        )}
        {step === 2 && (
          <EducationSection
            control={control}
            errors={errors}
            readOnly={readOnly}
            register={register}
            clearFieldError={clearFieldError}
          />
        )}
        {step === 3 && (
          <EmploymentSection
            control={control}
            errors={errors}
            readOnly={readOnly}
            setValue={setValue}
            clearFieldError={clearFieldError}
            employmentDocuments={employmentDocuments}
            setEmploymentDocuments={setEmploymentDocuments}
            awardsDocuments={awardsDocuments}
            setAwardsDocuments={setAwardsDocuments}
            existingDocuments={existingDocuments}
            showDocumentFields={allowDocuments}
            onRequestDeleteDocument={requestDeleteDocument}
            onFileError={(message) =>
              showToast({
                message,
                type: "error",
              })
            }
          />
        )}
        {step === 4 && (
          <JobHistorySection
            control={control}
            errors={errors}
            readOnly={readOnly}
            setValue={setValue}
            clearFieldError={clearFieldError}
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
              {submitLabel ?? (isNew ? "Submit Survey" : "Update Survey")}
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
      <ConfirmationDialog
        open={!readOnly && showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={() => void save()}
        title={
          onSave && !requireResponses
            ? "Add manual response?"
            : isNew
              ? "Submit survey?"
              : "Save changes?"
        }
        description={
          onSave && !requireResponses
            ? "Confirm that the available details have been transcribed correctly. Empty fields will remain unanswered."
            : isNew
              ? "You can return and update your answers while the study remains open."
              : "Your latest changes will replace the saved response."
        }
        cancelLabel="Review Form"
        confirmLabel={
          submitLabel ?? (isNew ? "Submit Survey" : "Update Survey")
        }
        busy={isSubmitting}
      />
      <ConfirmationDialog
        open={!readOnly && Boolean(documentToDelete)}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete) void handleDeleteDocument(documentToDelete);
        }}
        title="Delete document?"
        description={`Delete ${documentToDelete?.filename ?? "this document"}? This action cannot be undone.`}
        confirmLabel="Delete Document"
        busy={isSubmitting}
        tone="danger"
      />
    </div>
  );
}
