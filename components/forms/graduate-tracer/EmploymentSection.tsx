import { FileUploadField } from "@/components/forms/FileUploadField";
import { SelectField } from "@/components/forms/SelectField";
import { getGraduateTracerConditionalSections } from "@/lib/forms/graduate-tracer-validation";
import { graduateTracerV1 } from "@/lib/forms/registry";
import type { Survey, SurveyDocument, UnemploymentReason } from "@/types";
import {
  ErrorMessage,
  fieldStyles as styles,
  type RhfBridgeSectionProps,
} from "./shared";

const FORM_OPTIONS = graduateTracerV1.optionSets;
const EMPLOYMENT_FIELD_NAMES = [
  "employmentStatus",
  "currentEmploymentStatus",
  "currentOccupation",
  "companyName",
  "companyAddress",
  "businessIndustry",
  "placeOfWork",
  "unemploymentReasons",
  "unemploymentReasonOther",
] as const;

export function EmploymentSection({
  control,
  errors,
  readOnly,
  setValue,
  clearFieldError,
  employmentDocuments,
  setEmploymentDocuments,
  awardsDocuments,
  setAwardsDocuments,
  existingDocuments,
  onRequestDeleteDocument,
  onFileError,
  showDocumentFields,
}: RhfBridgeSectionProps & {
  employmentDocuments: File[];
  setEmploymentDocuments: (files: File[]) => void;

  awardsDocuments: File[];
  setAwardsDocuments: (files: File[]) => void;

  onFileError: (message: string) => void;
  showDocumentFields: boolean;

  existingDocuments: SurveyDocument[];
  onRequestDeleteDocument: (document: SurveyDocument) => void;
}) {
  const [
    employmentStatus,
    currentEmploymentStatus,
    currentOccupation,
    companyName,
    companyAddress,
    businessIndustry,
    placeOfWork,
    unemploymentReasons,
    unemploymentReasonOther,
  ] = useWatch({ control, name: EMPLOYMENT_FIELD_NAMES });
  const form = {
    employmentStatus,
    currentEmploymentStatus,
    currentOccupation,
    companyName,
    companyAddress,
    businessIndustry,
    placeOfWork,
    unemploymentReasons,
    unemploymentReasonOther,
  };
  const updateField = <K extends keyof Survey>(field: K, value: Survey[K]) => {
    if (readOnly) return;
    setValue(field, value as never, { shouldDirty: true });
    clearFieldError(field);
  };
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

import { useWatch } from "react-hook-form";
