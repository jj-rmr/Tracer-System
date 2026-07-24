"use client";

import { useEffect, useState } from "react";
import { Survey, UnemploymentReason } from "@/types";
import { useToast } from "@/components/ui/Toast";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { SelectField } from "@/components/forms/SelectField";
import { useRouter } from "next/navigation";
import { StringListField } from "@/components/forms/StringListField";
import { PROGRAMS } from "@/lib/programs/catalog";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { SurveyDocument } from "@/types";
import { graduateTracerV1 } from "@/lib/forms/registry";
import {
  getGraduateTracerConditionalSections,
  GraduateTracerFieldErrors,
  validateGraduateTracerStep,
} from "@/lib/forms/graduate-tracer-validation";

const FORM_OPTIONS = graduateTracerV1.optionSets;

interface Props {
  initialData: Survey;
  isNew: boolean;
  onSuccess?: () => void;
  onSave?: (
    survey: Survey,
    documents: PendingSurveyDocuments,
  ) => Promise<void>;
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
  const [form, setForm] = useState(initialData);

  useEffect(() => {
    setForm(initialData);
    setExistingDocuments(initialData.documents ?? []);
  }, [initialData]);
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

  function getStepErrors(currentStep: number): FormErrors {
    return validateGraduateTracerStep(form, currentStep);

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
        throw new Error("Document deletion is not configured for this response.");
      }
      await onDeleteDocument(document);

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

  async function save() {
    const valid = validateSteps([1, 2, 3, 4]);

    if (!valid) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!onSave) throw new Error("Response saving is not configured.");

      await onSave(form, {
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
          <SelectField
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
          <SelectField
            disabled={readOnly}
            id="civilStatus"
            label="Civil Status *"
            value={form.civilStatus}
            onChange={(val) => updateField("civilStatus", val as any)}
            options={FORM_OPTIONS.civilStatus}
            placeholder="Select"
            required
            hasError={!!errors.civilStatus}
          />
          <ErrorMessage message={errors.civilStatus} />
        </div>
        <div>
          <SelectField
            disabled={readOnly}
            id="sex"
            label="Sex *"
            value={form.sex}
            onChange={(val) => updateField("sex", val as any)}
            options={FORM_OPTIONS.sex}
            placeholder="Select"
            required
            hasError={!!errors.sex}
          />
          <ErrorMessage message={errors.sex} />
        </div>
      </div>

      <div className="space-y-3">
        <StringListField
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
          <SelectField
            id="program"
            disabled={readOnly}
            label="Program *"
            value={form.program}
            onChange={(value) => updateField("program", value)}
            options={PROGRAMS}
            hasError={!!errors.program}
            required
            placeholder="Select your program of study"
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

      <StringListField
        value={form.honors}
        onChange={(items) => updateField("honors", items)}
        label="Academic Honors / Awards Received"
        fieldName="honors"
        addButtonLabel="Add Honor / Award"
        placeholder="e.g. Cum Laude"
        readOnly={readOnly}
      />

      <StringListField
        value={form.trainings}
        onChange={(items) => updateField("trainings", items)}
        label="Professional Trainings Attended"
        fieldName="trainings"
        addButtonLabel="Add Training"
        placeholder="e.g. Web Development Bootcamp"
        readOnly={readOnly}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        <div>
          <SelectField
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
            <SelectField
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
  employmentDocuments,
  setEmploymentDocuments,
  awardsDocuments,
  setAwardsDocuments,
  existingDocuments,
  onRequestDeleteDocument,
  onFileError,
  showDocumentFields,
}: StepProps & {
  employmentDocuments: File[];
  setEmploymentDocuments: (files: File[]) => void;

  awardsDocuments: File[];
  setAwardsDocuments: (files: File[]) => void;

  onFileError: (message: string) => void;
  showDocumentFields: boolean;

  existingDocuments: SurveyDocument[];
  onRequestDeleteDocument: (document: SurveyDocument) => void;
}) {
  const conditions = getGraduateTracerConditionalSections(form);
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

      <SelectField
        disabled={readOnly}
        id="employmentStatus"
        label="Employment Status *"
        value={form.employmentStatus}
        onChange={(val) => {
          const employmentStatus = val as Survey["employmentStatus"];
          updateField("employmentStatus", employmentStatus);

          if (employmentStatus === "Yes") {
            updateField("unemploymentReasons", []);
            updateField("unemploymentReasonOther", "");
          } else {
            updateField("currentEmploymentStatus", "");
            updateField("currentOccupation", "");
            updateField("companyName", "");
            updateField("companyAddress", "");
            updateField("businessIndustry", "");
            updateField("placeOfWork", "");
          }

          if (employmentStatus === "Never Employed") {
            updateField("isFirstJob", null);
            updateField("isFirstJobRelated", null);
            updateField("stayingReasons", []);
            updateField("stayingReasonOther", "");
            updateField("acceptingReasons", []);
            updateField("acceptingReasonOther", "");
            updateField("changingReasons", []);
            updateField("changingReasonOther", "");
            updateField("firstJobDuration", "");
            updateField("firstJobDurationOther", "");
            updateField("firstJobSource", "");
            updateField("firstJobSourceOther", "");
            updateField("firstJobSearchDuration", "");
            updateField("firstJobSearchDurationOther", "");
            updateField("firstJobTitle", "");
            updateField("firstJobLevel", "");
            updateField("currentJobLevel", "");
            updateField("initialMonthlyIncome", "");
            updateField("curriculumRelevant", null);
            updateField("usefulCompetencies", []);
            updateField("usefulCompetencyOther", "");
          }
        }}
        options={FORM_OPTIONS.employmentStatus}
        placeholder="Select Employment Status"
        required
        hasError={!!errors.employmentStatus}
      />

      {conditions.showEmployedFields && (
        <div className="space-y-6 border-t border-slate-200 pt-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              disabled={readOnly}
              id="currentEmploymentStatus"
              label="Current Employment Status *"
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
              placeholder="Select Current Employment Status"
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
            <SelectField
              disabled={readOnly}
              id="businessIndustry"
              label="Business Industry *"
              description="Major line of business of the company you are presently employed in. Please check one only."
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
              placeholder="Select Business Industry"
              required
              hasError={!!errors.businessIndustry}
            />
            <SelectField
              disabled={readOnly}
              id="placeOfWork"
              label="Place of Work *"
              value={form.placeOfWork}
              onChange={(val) => updateField("placeOfWork", val as any)}
              options={FORM_OPTIONS.placeOfWork}
              placeholder="Select"
              required
              hasError={!!errors.placeOfWork}
            />
          </div>
          {showDocumentFields && (
            <>
              <FileUploadField
                id="employmentDocuments"
                name="employmentDocuments"
                label="Employment Documents"
                files={employmentDocuments}
                onChange={setEmploymentDocuments}
                existingDocuments={existingDocuments.filter(
                  (document) => document.documentType === "employment",
                )}
                onRequestDeleteDocument={onRequestDeleteDocument}
                accept=".pdf,.doc,.docx"
                hint="To verify your employment status, please provide supporting documentation, such as a company ID and/or a copy of your employment contract."
                disabled={readOnly}
                maxFiles={5}
                onError={onFileError}
              />

              <FileUploadField
                id="awardsDocuments"
                name="awardsDocuments"
                label="Awards Documents"
                files={awardsDocuments}
                onChange={setAwardsDocuments}
                existingDocuments={existingDocuments.filter(
                  (document) => document.documentType === "awards",
                )}
                onRequestDeleteDocument={onRequestDeleteDocument}
                accept=".pdf,.doc,.docx"
                hint="Upload copies of awards, recognition, and feedback from employers."
                disabled={readOnly}
                maxFiles={5}
                onError={onFileError}
              />
            </>
          )}
        </div>
      )}

      <div className="space-y-4 border-t border-slate-200 pt-4">
        {conditions.showUnemploymentReasons && (
          <div className="space-y-2 border-t border-slate-200 pt-4">
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
      </div>
    </div>
  );
}

function JobHistoryStep({ form, errors, updateField, readOnly }: StepProps) {
  const conditions = getGraduateTracerConditionalSections(form);
  const durations = FORM_OPTIONS.jobDuration.map((option) => option.value);
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
  const incomes = FORM_OPTIONS.monthlyIncome.map((option) => option.value);
  const levels = FORM_OPTIONS.jobLevel.map((option) => option.value);
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
  const compList = FORM_OPTIONS.competencies.map((option) => option.value);

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

  if (!conditions.hasJobHistory) {
    return (
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-slate-900">
          First Job & Curriculum Feedback
        </h3>
        <p className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">
          This section does not apply because you selected Never Employed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">
        First Job & Curriculum Feedback
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField
          disabled={readOnly}
          id="isFirstJob"
          label="Is this your FIRST JOB after college? *"
          value={
            form.isFirstJob === true
              ? "true"
              : form.isFirstJob === false
                ? "false"
                : ""
          }
          onChange={(val) => {
            const isFirstJob = val === "true";
            updateField("isFirstJob", isFirstJob);

            if (isFirstJob) {
              updateField("changingReasons", []);
              updateField("changingReasonOther", "");
            } else {
              updateField("isFirstJobRelated", null);
              updateField("stayingReasons", []);
              updateField("stayingReasonOther", "");
              updateField("acceptingReasons", []);
              updateField("acceptingReasonOther", "");
            }
          }}
          options={FORM_OPTIONS.yesNo}
          placeholder="Select"
          required
          hasError={!!errors.isFirstJob}
        />

        {conditions.showFirstJobRelated && (
          <SelectField
            disabled={readOnly}
            id="isFirstJobRelated"
            label="Is your FIRST JOB related to your college course? *"
            value={
              form.isFirstJobRelated === true
                ? "true"
                : form.isFirstJobRelated === false
                  ? "false"
                  : ""
            }
            onChange={(val) => {
              const isRelated = val === "true";
              updateField("isFirstJobRelated", isRelated);

              if (isRelated) {
                updateField("acceptingReasons", []);
                updateField("acceptingReasonOther", "");
              }
            }}
            options={FORM_OPTIONS.yesNo}
            placeholder="Select"
            required
            hasError={!!errors.isFirstJobRelated}
          />
        )}
      </div>

      {conditions.showStayingReasons && (
        <>
          <div className="space-y-2 border-t border-slate-200 pt-4">
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
          {conditions.showAcceptingReasons && <div>
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
          </div>}
        </>
      )}

      {conditions.showChangingReasons && (
        <div className="space-y-4 border-t border-slate-200 pt-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-200 pt-4">
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
          <SelectField
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
          <SelectField
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
          <SelectField
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
          <SelectField
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
          <SelectField
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
          <SelectField
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
      <div className="space-y-4 border-t border-slate-200 pt-4">
        <SelectField
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
          options={FORM_OPTIONS.yesNo}
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
