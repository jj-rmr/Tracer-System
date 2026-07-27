"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import type { Survey, SurveyDocument, SurveyDocumentType } from "@/types";

interface Props {
  initialData: Survey;
  isNew: boolean;
  onSuccess?: () => void;
  onSave?: (survey: Survey, documents: PendingSurveyDocuments) => Promise<void>;
  onDraftSave?: (survey: Survey) => Promise<string | undefined>;
  onInstantDocumentUpload?: (
    survey: Survey,
    file: File,
    documentType: SurveyDocumentType,
  ) => Promise<SurveyDocument>;
  onDeleteDocument?: (document: SurveyDocument) => Promise<void>;
  readOnly?: boolean;
  allowDocuments?: boolean;
  requireResponses?: boolean;
  submitLabel?: string;
  initialSavedAt?: string;
  onValuesChange?: (survey: Survey) => void;
  onRequestClose?: () => void;
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
  onDraftSave,
  onInstantDocumentUpload,
  onDeleteDocument,
  readOnly = false,
  allowDocuments = true,
  requireResponses = true,
  submitLabel,
  initialSavedAt,
  onValuesChange,
  onRequestClose,
}: Props) {
  // Treat server data as mount-time defaults. Resetting when an autosave response
  // updates the parent would replace edits made while that request was in flight.
  const { control, getValues, register, setValue } = useForm<Survey>({
    defaultValues: initialData,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaveState, setDraftSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >(initialSavedAt ? "saved" : "idle");
  const [lastSavedAt, setLastSavedAt] = useState(initialSavedAt);
  const [activeDocumentUploads, setActiveDocumentUploads] = useState(0);
  const [employmentDocuments, setEmploymentDocuments] = useState<File[]>([]);

  const [awardsDocuments, setAwardsDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<SurveyDocument[]>(
    initialData.documents ?? [],
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<SurveyDocument | null>(null);
  const { showToast } = useToast();
  const watchedValues = useWatch({ control });
  const lastDraftSignatureRef = useRef(JSON.stringify(initialData));
  const draftAttemptRef = useRef(0);
  const uploadingFilesRef = useRef(new WeakSet<File>());
  const employmentDocumentsRef = useRef(employmentDocuments);
  const awardsDocumentsRef = useRef(awardsDocuments);

  const router = useRouter();

  useEffect(() => {
    employmentDocumentsRef.current = employmentDocuments;
    awardsDocumentsRef.current = awardsDocuments;
  }, [awardsDocuments, employmentDocuments]);

  useEffect(() => {
    onValuesChange?.(getValues());
  }, [getValues, onValuesChange, watchedValues]);

  useEffect(() => {
    if (!onDraftSave || readOnly || isSubmitting) return;

    const signature = JSON.stringify(watchedValues);
    if (signature === lastDraftSignatureRef.current) return;

    const timer = window.setTimeout(() => {
      const snapshot = getValues();
      const attempt = ++draftAttemptRef.current;
      setDraftSaveState("saving");

      void onDraftSave(snapshot)
        .then((savedAt) => {
          lastDraftSignatureRef.current = signature;
          if (attempt === draftAttemptRef.current) {
            setLastSavedAt(savedAt ?? new Date().toISOString());
            setDraftSaveState("saved");
          }
        })
        .catch((error) => {
          console.error("Draft autosave failed:", error);
          if (attempt === draftAttemptRef.current) {
            setDraftSaveState("error");
          }
        });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [getValues, isSubmitting, onDraftSave, readOnly, watchedValues]);

  useEffect(() => {
    if (!onInstantDocumentUpload || readOnly) return;
    const instantUpload = onInstantDocumentUpload;

    function beginUpload(
      file: File,
      documentType: SurveyDocumentType,
      selectedFilesRef: React.RefObject<File[]>,
      setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    ) {
      if (uploadingFilesRef.current.has(file)) return;

      uploadingFilesRef.current.add(file);
      setActiveDocumentUploads((count) => count + 1);

      void instantUpload(getValues(), file, documentType)
        .then(async (document) => {
          if (!selectedFilesRef.current.includes(file)) {
            if (onDeleteDocument) await onDeleteDocument(document);
            return;
          }

          setFiles((current) => current.filter((item) => item !== file));
          setExistingDocuments((current) => [...current, document]);
          setValue("documents", [...getValues("documents"), document]);
        })
        .catch((error) => {
          console.error("Instant document upload failed:", error);
          showToast({
            message: `Could not upload ${file.name}. It will be retried when you submit.`,
            type: "error",
          });
        })
        .finally(() => {
          setActiveDocumentUploads((count) => Math.max(0, count - 1));
        });
    }

    employmentDocuments.forEach((file) =>
      beginUpload(
        file,
        "employment",
        employmentDocumentsRef,
        setEmploymentDocuments,
      ),
    );
    awardsDocuments.forEach((file) =>
      beginUpload(file, "awards", awardsDocumentsRef, setAwardsDocuments),
    );
  }, [
    awardsDocuments,
    employmentDocuments,
    getValues,
    onDeleteDocument,
    onInstantDocumentUpload,
    readOnly,
    setValue,
    showToast,
  ]);

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
    } catch (err: unknown) {
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
      <div className="md:bg-muted md:border border-border rounded-2xl md:p-4">
        <div className="flex justify-between text-sm font-medium text-foreground">
          <span>
            Step {step} of {sections.length}
          </span>
          <span className="text-muted-foreground font-semibold">
            {sections[step - 1]}
          </span>
        </div>
        <div className="h-2 bg-secondary border border-border rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-muted-foreground transition-[width] duration-300"
            style={{ width: `${(step / sections.length) * 100}%` }}
          />
        </div>
        {onDraftSave && !readOnly && (
          <p
            aria-live="polite"
            className={`mt-2 text-right text-xs font-medium ${
              draftSaveState === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {draftSaveState === "saving"
              ? "Saving draft..."
              : draftSaveState === "error"
                ? "Draft not saved. Changes will retry after your next edit."
                : lastSavedAt
                  ? `Draft saved ${new Date(lastSavedAt).toLocaleTimeString(
                      "en-PH",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}`
                  : "Draft autosave is on"}
          </p>
        )}
      </div>
      {/* Render Steps */}
      <div className="min-h-100 bg-card md:border border-border rounded-2xl md:p-6 md:shadow-sm">
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
      {activeDocumentUploads > 0 && (
        <p
          className="text-right text-xs font-medium text-muted-foreground"
          aria-live="polite"
        >
          Uploading {activeDocumentUploads} document
          {activeDocumentUploads === 1 ? "" : "s"}...
        </p>
      )}
      <div className="flex flex-col-reverse md:flex-row justify-stretch md:justify-end gap-4">
        {onRequestClose && !readOnly && (
          <Button
            type="button"
            variant="outline-elevated"
            onClick={onRequestClose}
            disabled={isSubmitting}
          >
            Close Form
          </Button>
        )}
        {step > 1 && (
          <Button
            variant="outline-elevated"
            onClick={() => handleStep("backward")}
            disabled={isSubmitting || activeDocumentUploads > 0}
          >
            Previous Section
          </Button>
        )}

        {!readOnly ? (
          step === sections.length ? (
            <Button
              variant="elevated"
              onClick={handlePreSubmitCheck}
              disabled={isSubmitting || activeDocumentUploads > 0}
            >
              {submitLabel ?? (isNew ? "Submit Response" : "Update Response")}
            </Button>
          ) : (
            <Button
              variant="elevated"
              onClick={() => validateStep(step) && handleStep("forward")}
              disabled={isSubmitting || activeDocumentUploads > 0}
            >
              Next Section
            </Button>
          )
        ) : (
          step < sections.length && (
            <Button variant="elevated" onClick={() => handleStep("forward")}>
              Next Section
            </Button>
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
              ? "Submit response?"
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
          submitLabel ?? (isNew ? "Submit Response" : "Update Response")
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
