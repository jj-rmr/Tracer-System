"use client";

import { useEffect, useState } from "react";
import { Survey } from "@/types/survey";
import { useToast } from "../Toast";
import { Dropdown } from "../Dropdown";
import { useRouter } from "next/navigation";
import { LuPlus } from "react-icons/lu";

interface Props {
  initialData: Survey;
  isNew: boolean;
  onSuccess?: () => void;
}

export type FormErrors = Partial<Record<keyof Survey, string>>;

export default function SurveyForm({ initialData, isNew, onSuccess }: Props) {
  const [form, setForm] = useState<Survey>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const router = useRouter();

  const sections = [
    "Personal & Contact Info",
    "Education & Graduate Studies",
    "Employment Profile",
    "First Job & Curriculum Evaluation",
  ];

  function updateField<K extends keyof Survey>(field: K, value: Survey[K]) {
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
        newErrors.firstName = "First name is required.";
      if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
      if (!form.barangay.trim()) newErrors.barangay = "Barangay is required.";
      if (!form.municipality.trim())
        newErrors.municipality = "Municipality is required.";
      if (!form.province.trim()) newErrors.province = "Province is required.";
      if (!form.region.trim()) newErrors.region = "Region is required.";
      if (!form.civilStatus)
        newErrors.civilStatus = "Civil status is required.";
      if (!form.sex) newErrors.sex = "Sex configuration required.";
      if (
        form.contactNumbers.length === 0 ||
        form.contactNumbers.some((n) => !n.trim())
      ) {
        newErrors.contactNumbers = "Provide at least one valid contact number.";
      }
    }

    if (currentStep === 2) {
      if (!form.yearGraduated) {
        newErrors.yearGraduated = "Graduation year is required.";
      } else if (
        form.yearGraduated < 1900 ||
        form.yearGraduated > new Date().getFullYear()
      ) {
        newErrors.yearGraduated = "Enter a valid graduation year.";
      }
      if (
        form.advanceStudyDegree === "Others" &&
        !form.advanceStudyOther.trim()
      ) {
        newErrors.advanceStudyOther = "Specify other advanced degree details.";
      }
      if (
        form.advanceStudyReasons === "Others" &&
        !form.advanceStudyReasonOther.trim()
      ) {
        newErrors.advanceStudyReasonOther =
          "Specify other reasons for advanced study.";
      }
    }

    if (currentStep === 3) {
      if (!form.employmentStatus)
        newErrors.employmentStatus = "Employment status is required.";

      if (form.employmentStatus === "Yes") {
        if (!form.presentEmploymentStatus)
          newErrors.presentEmploymentStatus = "Present status required.";
        if (!form.presentOccupation.trim())
          newErrors.presentOccupation = "Occupation field required.";
        if (!form.companyName.trim())
          newErrors.companyName = "Company name required.";
        if (!form.companyAddress.trim())
          newErrors.companyAddress = "Company address required.";
        if (!form.businessIndustry)
          newErrors.businessIndustry = "Business industry choice required.";
        if (!form.placeOfWork)
          newErrors.placeOfWork = "Place of work choice required.";
      } else {
        if (form.unemploymentReasons.length === 0) {
          newErrors.unemploymentReasons =
            "Select at least one unemployment reason.";
        }
        if (
          form.unemploymentReasons.includes("Others") &&
          !form.unemploymentReasonOther.trim()
        ) {
          newErrors.unemploymentReasonOther =
            "Please specify the other reason.";
        }
      }
    }

    if (currentStep === 4) {
      if (form.isFirstJob === undefined || form.isFirstJob === null)
        newErrors.isFirstJob = "Specify if first job.";
      if (
        form.isFirstJobRelated === undefined ||
        form.isFirstJobRelated === null
      )
        newErrors.isFirstJobRelated = "Specify if first job was related.";
      if (form.isFirstJob) {
        if (form.stayingReasons.length === 0)
          newErrors.stayingReasons = "Select at least one reason.";
        if (
          form.stayingReasons.includes("Others") &&
          !form.stayingReasonOther.trim()
        )
          newErrors.stayingReasonOther = "Specify other staying reason.";
      } else {
        if (form.acceptingReasons.length === 0)
          newErrors.acceptingReasons = "Select at least one reason.";
        if (
          form.acceptingReasons.includes("Others") &&
          !form.acceptingReasonOther.trim()
        )
          newErrors.acceptingReasonOther = "Specify other accepting reason.";
        if (form.changingReasons.length === 0)
          newErrors.changingReasons = "Select at least one reason.";
        if (
          form.changingReasons.includes("Others") &&
          !form.changingReasonOther.trim()
        )
          newErrors.changingReasonOther = "Specify other changing reason.";
      }
      if (!form.firstJobTitle.trim())
        newErrors.firstJobTitle = "First job title required.";
      if (!form.firstJobDuration)
        newErrors.firstJobDuration = "First job duration required.";
      if (
        form.firstJobDuration === "Others" &&
        !form.firstJobDurationOther.trim()
      )
        newErrors.firstJobDurationOther = "Specify other duration.";
      if (!form.firstJobSource)
        newErrors.firstJobSource = "First job source required.";
      if (form.firstJobSource === "Others" && !form.firstJobSourceOther.trim())
        newErrors.firstJobSourceOther = "Specify other source.";
      if (!form.firstJobSearchDuration)
        newErrors.firstJobSearchDuration = "Search duration required.";
      if (
        form.firstJobSearchDuration === "Others" &&
        !form.firstJobSearchDurationOther.trim()
      )
        newErrors.firstJobSearchDurationOther =
          "Specify other search duration.";
      if (!form.firstJobLevel)
        newErrors.firstJobLevel = "First job level required.";
      if (!form.currentJobLevel)
        newErrors.currentJobLevel = "Current job level required.";
      if (!form.initialMonthlyIncome)
        newErrors.initialMonthlyIncome = "Monthly income tier required.";
      if (
        form.curriculumRelevant === undefined ||
        form.curriculumRelevant === null
      )
        newErrors.curriculumRelevant = "Curriculum relevance check required.";
      if (form.usefulCompetencies.length === 0)
        newErrors.usefulCompetencies = "Select at least one competency.";
      if (
        form.usefulCompetencies.includes("Others") &&
        !form.usefulCompetencyOther.trim()
      )
        newErrors.usefulCompetencyOther = "Specify other competencies.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleStep(move: "forward" | "backward") {
    setStep((prev) => (move === "forward" ? prev + 1 : prev - 1));

    // Dispatch a custom event to tell the window a step happened
    window.dispatchEvent(new Event("stepchanged"));
  }

  async function save() {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      const { id, $id, ...surveyData } = form as any;

      const response = await fetch("/api/alumni/survey", {
        method: isNew ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      onSuccess?.();
      setShowSaveModal(false);
      router.refresh();
      showToast({
        message: isNew
          ? "Form saved successfully"
          : "Changes saved successfully!",
        type: "success",
      });
    } catch (err: any) {
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

  // Form submit button intercepts and opens the confirmation modal
  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveModal(true);
  };

  return (
    <div className="w-full max-w-5xl space-y-8">
      {/* Progress */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
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
      <div className="min-h-100 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {step === 1 && (
          <PersonalInfoStep
            form={form}
            errors={errors}
            updateField={updateField}
          />
        )}
        {step === 2 && (
          <EducationStep
            form={form}
            errors={errors}
            updateField={updateField}
          />
        )}
        {step === 3 && (
          <EmploymentStep
            form={form}
            errors={errors}
            updateField={updateField}
          />
        )}
        {step === 4 && (
          <JobHistoryStep
            form={form}
            errors={errors}
            updateField={updateField}
          />
        )}
      </div>
      {/* Buttons */}
      <div
        className={`flex gap-4  flex-col-reverse md:flex-row items-stretch md:items-end ${step > 1 ? `justify-between` : `justify-end`}  border-t border-slate-200 pt-6`}
      >
        {step > 1 && (
          <button
            onClick={() => handleStep("backward")}
            className="border border-slate-300 rounded-xl px-6 py-3 font-medium text-slate-700"
          >
            Previous Section
          </button>
        )}

        {step === sections.length ? (
          <button
            onClick={handlePreSubmitCheck}
            disabled={isSubmitting}
            className="bg-sky-500 text-white font-medium rounded-xl px-6 py-3 hover:bg-sky-600 disabled:opacity-50 shadow-sm"
          >
            {isNew ? "Submit Survey" : "Update Survey"}
          </button>
        ) : (
          <button
            onClick={() => validateStep(step) && handleStep("forward")}
            className="bg-sky-500 text-white whitespace-nowrap font-medium rounded-xl px-6 py-3 hover:bg-sky-600 shadow-sm"
          >
            Next Section
          </button>
        )}
      </div>{" "}
      {showSaveModal && (
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
                  : isNew
                    ? "Submit Survey"
                    : "Update Survey"}
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
  updateField: <K extends keyof Survey>(field: K, value: Survey[K]) => void;
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-500">{message}</p>;
}

const styles = {
  input: (err: boolean) =>
    `w-full p-4 rounded-2xl border bg-white text-slate-950 text-sm focus:outline-none focus:ring-2 transition duration-300 ${err ? "border-rose-400 focus:ring-rose-100" : "border-sky-200 focus:ring-sky-100 focus:border-sky-500"}`,
  label:
    "block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2",
};

function PersonalInfoStep({ form, errors, updateField }: StepProps) {
  const handleArrayChange = (index: number, val: string) => {
    const list = [...form.contactNumbers];
    list[index] = val;
    updateField("contactNumbers", list);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">
        Personal & Contact Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className={styles.label}>First Name *</label>
          <input
            type="text"
            className={styles.input(!!errors.firstName)}
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          <ErrorMessage message={errors.firstName} />
        </div>
        <div>
          <label className={styles.label}>Middle Name</label>
          <input
            type="text"
            className={styles.input(false)}
            value={form.middleName}
            onChange={(e) => updateField("middleName", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>Last Name *</label>
          <input
            type="text"
            className={styles.input(!!errors.lastName)}
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
          <ErrorMessage message={errors.lastName} />
        </div>
        <div>
          <label className={styles.label}>Extension Name</label>
          <input
            type="text"
            className={styles.input(false)}
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
            type="text"
            className={styles.input(false)}
            value={form.street}
            onChange={(e) => updateField("street", e.target.value)}
          />
          <ErrorMessage message={errors.street} />
        </div>
        <div>
          <label className={styles.label}>Barangay *</label>
          <input
            type="text"
            className={styles.input(!!errors.barangay)}
            value={form.barangay}
            onChange={(e) => updateField("barangay", e.target.value)}
          />
          <ErrorMessage message={errors.barangay} />
        </div>
        <div>
          <label className={styles.label}>Municipality *</label>
          <input
            type="text"
            className={styles.input(!!errors.municipality)}
            value={form.municipality}
            onChange={(e) => updateField("municipality", e.target.value)}
          />
          <ErrorMessage message={errors.municipality} />
        </div>
        <div>
          <label className={styles.label}>Province *</label>
          <input
            type="text"
            className={styles.input(!!errors.province)}
            value={form.province}
            onChange={(e) => updateField("province", e.target.value)}
          />
          <ErrorMessage message={errors.province} />
        </div>
        <div>
          <Dropdown
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

      {/* Aggregated String Arrays Container */}
      <div className="space-y-3">
        <label className={styles.label}>Contact Numbers *</label>
        {form.contactNumbers.map((num, i) => (
          <div key={i} className="flex items-center space-x-2">
            <input
              type="text"
              className={styles.input(!!errors.contactNumbers)}
              value={num}
              onChange={(e) => handleArrayChange(i, e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 text-sm border rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 transition"
              onClick={() =>
                updateField(
                  "contactNumbers",
                  form.contactNumbers.filter((_, idx) => idx !== i),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-sky-600 flex items-center gap-2 py-2 pl-3 pr-4 hover:bg-sky-100 transition rounded-lg"
          onClick={() =>
            updateField("contactNumbers", [...form.contactNumbers, ""])
          }
        >
          <LuPlus /> Add Contact Number
        </button>
        <ErrorMessage message={errors.contactNumbers} />
      </div>
    </div>
  );
}

function EducationStep({ form, errors, updateField }: StepProps) {
  const handleArr = (
    field: "honors" | "trainings",
    idx: number,
    val: string,
  ) => {
    const list = [...form[field]];
    list[idx] = val;
    updateField(field, list);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Academic Background</h3>

      <div>
        <label className={styles.label}>Year Graduated *</label>
        <input
          type="number"
          className={styles.input(!!errors.yearGraduated)}
          value={form.yearGraduated}
          onChange={(e) =>
            updateField("yearGraduated", parseInt(e.target.value))
          }
        />
        <ErrorMessage message={errors.yearGraduated} />
      </div>

      {/* Honors List */}
      <div className="space-y-3">
        <label className={styles.label}>Academic Honors/Awards Received</label>
        {form.honors.map((item, i) => (
          <div key={i} className="flex space-x-2">
            <input
              type="text"
              className={styles.input(false)}
              value={item}
              onChange={(e) => handleArr("honors", i, e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded-xl bg-slate-50 text-rose-600"
              onClick={() =>
                updateField(
                  "honors",
                  form.honors.filter((_, idx) => idx !== i),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-sky-600"
          onClick={() => updateField("honors", [...form.honors, ""])}
        >
          + Add Honor/Award
        </button>
      </div>

      {/* Trainings List */}
      <div className="space-y-3">
        <label className={styles.label}>Professional Trainings Attended</label>
        {form.trainings.map((item, i) => (
          <div key={i} className="flex space-x-2">
            <input
              type="text"
              className={styles.input(false)}
              value={item}
              onChange={(e) => handleArr("trainings", i, e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded-xl bg-slate-50 text-rose-600"
              onClick={() =>
                updateField(
                  "trainings",
                  form.trainings.filter((_, idx) => idx !== i),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-semibold text-sky-600"
          onClick={() => updateField("trainings", [...form.trainings, ""])}
        >
          + Add Training
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div>
          <Dropdown
            id="advanceStudyDegree"
            label="Advanced Graduate Studies Degree"
            value={form.advanceStudyDegree}
            onChange={(val) => updateField("advanceStudyDegree", val as any)}
            options={[
              { value: "MS", label: "MS" },
              { value: "MA", label: "MA" },
              { value: "Others", label: "Others" },
            ]}
            placeholder="None"
            hasError={false}
          />
        </div>
        <div>
          <Dropdown
            id="advanceStudyReasons"
            label="Reason for Pursuing Graduate Studies"
            value={form.advanceStudyReasons}
            onChange={(val) => updateField("advanceStudyReasons", val as any)}
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
      </div>

      {form.advanceStudyDegree === "Others" && (
        <div>
          <label className={styles.label}>Specify Advanced Degree *</label>
          <input
            type="text"
            className={styles.input(!!errors.advanceStudyOther)}
            value={form.advanceStudyOther}
            onChange={(e) => updateField("advanceStudyOther", e.target.value)}
          />
          <ErrorMessage message={errors.advanceStudyOther} />
        </div>
      )}

      {form.advanceStudyReasons === "Others" && (
        <div>
          <label className={styles.label}>Specify Reason *</label>
          <input
            type="text"
            className={styles.input(!!errors.advanceStudyReasonOther)}
            value={form.advanceStudyReasonOther}
            onChange={(e) =>
              updateField("advanceStudyReasonOther", e.target.value)
            }
          />
          <ErrorMessage message={errors.advanceStudyReasonOther} />
        </div>
      )}
    </div>
  );
}

function EmploymentStep({ form, errors, updateField }: StepProps) {
  const unempOptions: any[] = [
    "Advance Study",
    "Family Concern",
    "Health",
    "Lack of Work Experience",
    "No Job Opportunity",
    "Did Not Look For Job",
    "Others",
  ];

  const toggleUnemploymentReason = (reason: any) => {
    const list = [...form.unemploymentReasons];
    const idx = list.indexOf(reason);
    if (idx > -1) list.splice(idx, 1);
    else list.push(reason);
    updateField("unemploymentReasons", list);
  };

  const handleDocArr = (
    field: "employmentDocuments" | "awardDocuments",
    idx: number,
    val: string,
  ) => {
    const list = [...form[field]];
    list[idx] = val;
    updateField(field, list);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Employment Profile</h3>

      <Dropdown
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
              id="presentEmploymentStatus"
              label="Present Employment Status *"
              value={form.presentEmploymentStatus}
              onChange={(val) =>
                updateField("presentEmploymentStatus", val as any)
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
              hasError={!!errors.presentEmploymentStatus}
            />
            <div>
              <label className={styles.label}>Present Occupation *</label>
              <input
                type="text"
                className={styles.input(!!errors.presentOccupation)}
                value={form.presentOccupation}
                onChange={(e) =>
                  updateField("presentOccupation", e.target.value)
                }
              />
              <ErrorMessage message={errors.presentOccupation} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={styles.label}>Company Name *</label>
              <input
                type="text"
                className={styles.input(!!errors.companyName)}
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />
              <ErrorMessage message={errors.companyName} />
            </div>
            <div>
              <label className={styles.label}>Company Address *</label>
              <input
                type="text"
                className={styles.input(!!errors.companyAddress)}
                value={form.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
              />
              <ErrorMessage message={errors.companyAddress} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
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

          {/* Verification documents paths */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className={styles.label}>
                Employment Verification Documents (URLs/Reference Strings)
              </label>
              {form.employmentDocuments.map((doc, idx) => (
                <div key={idx} className="flex space-x-2">
                  <input
                    type="text"
                    className={styles.input(false)}
                    value={doc}
                    onChange={(e) =>
                      handleDocArr("employmentDocuments", idx, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border rounded-xl text-rose-600"
                    onClick={() =>
                      updateField(
                        "employmentDocuments",
                        form.employmentDocuments.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs font-semibold text-sky-600"
                onClick={() =>
                  updateField("employmentDocuments", [
                    ...form.employmentDocuments,
                    "",
                  ])
                }
              >
                + Add Document Reference
              </button>
            </div>

            <div className="space-y-2">
              <label className={styles.label}>
                Awards Verification Documents
              </label>
              {form.awardDocuments.map((doc, idx) => (
                <div key={idx} className="flex space-x-2">
                  <input
                    type="text"
                    className={styles.input(false)}
                    value={doc}
                    onChange={(e) =>
                      handleDocArr("awardDocuments", idx, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border rounded-xl text-rose-600"
                    onClick={() =>
                      updateField(
                        "awardDocuments",
                        form.awardDocuments.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs font-semibold text-sky-600"
                onClick={() =>
                  updateField("awardDocuments", [...form.awardDocuments, ""])
                }
              >
                + Add Award Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {(form.employmentStatus === "No" ||
        form.employmentStatus === "Never Employed") && (
        <div className="space-y-4 border-t border-sky-200 pt-4 animate-fadeIn">
          <label className={styles.label}>Reasons for Unemployment *</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unempOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center space-x-3 bg-sky-50 hover:bg-sky-100 hover:-translate-y-1 transition p-4 shadow-sm shadow-sky-100 rounded-xl cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.unemploymentReasons.includes(opt)}
                  onChange={() => toggleUnemploymentReason(opt)}
                  className="cursor-pointer"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          <ErrorMessage message={errors.unemploymentReasons} />

          {form.unemploymentReasons.includes("Others") && (
            <div>
              <label className={styles.label}>Specify Other Reason *</label>
              <input
                type="text"
                className={styles.input(!!errors.unemploymentReasonOther)}
                value={form.unemploymentReasonOther}
                onChange={(e) =>
                  updateField("unemploymentReasonOther", e.target.value)
                }
              />
              <ErrorMessage message={errors.unemploymentReasonOther} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobHistoryStep({ form, errors, updateField }: StepProps) {
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

      {/* Conditional Reasons Arrays Selection UI */}
      {form.isFirstJob === true && (
        <div className="space-y-2 border-t pt-4">
          <label className={styles.label}>
            Reasons for staying in your first job *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reasonsList.map((r) => (
              <label key={r} className="flex items-center space-x-2 text-sm">
                <input
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
              type="text"
              className={styles.input(!!errors.stayingReasonOther)}
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
                type="text"
                className={styles.input(!!errors.acceptingReasonOther)}
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
                type="text"
                className={styles.input(!!errors.changingReasonOther)}
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
            type="text"
            className={styles.input(!!errors.firstJobTitle)}
            value={form.firstJobTitle}
            onChange={(e) => updateField("firstJobTitle", e.target.value)}
          />
          <ErrorMessage message={errors.firstJobTitle} />
        </div>
        <div>
          <Dropdown
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
                type="text"
                className={`${styles.input(!!errors.firstJobDurationOther)} mt-2`}
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
                type="text"
                className={`${styles.input(!!errors.firstJobSourceOther)} mt-2`}
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
              type="text"
              className={`${styles.input(!!errors.usefulCompetencyOther)} mt-2`}
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
