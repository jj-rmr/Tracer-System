import { SelectField } from "@/components/forms/SelectField";
import { getGraduateTracerConditionalSections } from "@/lib/forms/graduate-tracer-validation";
import { graduateTracerV1 } from "@/lib/forms/registry";
import type { Survey } from "@/types";
import {
  ErrorMessage,
  fieldStyles as styles,
  type RhfBridgeSectionProps,
} from "./shared";

const FORM_OPTIONS = graduateTracerV1.optionSets;
const JOB_HISTORY_FIELD_NAMES = [
  "employmentStatus",
  "isFirstJob",
  "isFirstJobRelated",
  "stayingReasons",
  "stayingReasonOther",
  "acceptingReasons",
  "acceptingReasonOther",
  "changingReasons",
  "changingReasonOther",
  "firstJobTitle",
  "firstJobSearchDuration",
  "firstJobSearchDurationOther",
  "firstJobDuration",
  "firstJobDurationOther",
  "firstJobSource",
  "firstJobSourceOther",
  "firstJobLevel",
  "currentJobLevel",
  "initialMonthlyIncome",
  "curriculumRelevant",
  "usefulCompetencies",
  "usefulCompetencyOther",
] as const;

export function JobHistorySection({
  control,
  errors,
  readOnly,
  setValue,
  clearFieldError,
}: RhfBridgeSectionProps) {
  const values = useWatch({ control, name: JOB_HISTORY_FIELD_NAMES });
  const form = Object.fromEntries(
    JOB_HISTORY_FIELD_NAMES.map((fieldName, index) => [
      fieldName,
      values[index],
    ]),
  ) as Pick<Survey, (typeof JOB_HISTORY_FIELD_NAMES)[number]>;
  const updateField = <K extends keyof Survey>(field: K, value: Survey[K]) => {
    if (readOnly) return;
    setValue(field, value as never, { shouldDirty: true });
    clearFieldError(field);
  };
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
          {conditions.showAcceptingReasons && (
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
          )}
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
import { useWatch } from "react-hook-form";
