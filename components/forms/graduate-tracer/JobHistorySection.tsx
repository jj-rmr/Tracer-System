import { useWatch } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

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
    val: string,
  ) => {
    const list: string[] = [...form[field]];
    const idx = list.indexOf(val);
    if (idx > -1) list.splice(idx, 1);
    else list.push(val);
    updateField(field, list as Survey[typeof field]);
  };

  if (!conditions.hasJobHistory) {
    return (
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-foreground">
          First Job & Curriculum Feedback
        </h3>
        <p className="rounded-2xl border border-border bg-muted p-4 text-sm text-foreground">
          This section applies only to respondents who are presently employed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">
        First Job & Curriculum Feedback
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField
          disabled={readOnly}
          id="isFirstJob"
          label="Is your present job your first job after college? *"
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
              if (form.isFirstJobRelated !== false) {
                updateField("changingReasons", []);
                updateField("changingReasonOther", "");
              }
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
            label="Is your first job related to the course or program you completed in college? *"
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

              if (!isRelated) {
                updateField("acceptingReasons", []);
                updateField("acceptingReasonOther", "");
              } else {
                updateField("changingReasons", []);
                updateField("changingReasonOther", "");
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
          <div className="space-y-2 border-t border-border pt-4">
            <label className={styles.label}>
              What are your reasons for staying in your present job? Select all
              that apply. *
            </label>
            <div
              data-input-surface
              data-invalid={!!errors.stayingReasons || undefined}
              className={`${styles.choiceGroup(
                !!errors.stayingReasons,
                readOnly,
              )} grid-cols-1 sm:grid-cols-2`}
            >
              {reasonsList.map((r) => (
                <label
                  key={r}
                  className={styles.choice(!!errors.stayingReasons, readOnly)}
                >
                  <Checkbox
                    disabled={readOnly}
                    aria-invalid={!!errors.stayingReasons}
                    checked={form.stayingReasons.includes(
                      r as Survey["stayingReasons"][number],
                    )}
                    onCheckedChange={() => toggleList("stayingReasons", r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={errors.stayingReasons} />
            {form.stayingReasons.includes("Others") && (
              <div>
                <Input
                  disabled={readOnly}
                  type="text"
                  className={styles.input(
                    !!errors.stayingReasonOther,
                    readOnly,
                  )}
                  placeholder="Specify other reasons"
                  value={form.stayingReasonOther}
                  onChange={(e) =>
                    updateField("stayingReasonOther", e.target.value)
                  }
                />
                <ErrorMessage message={errors.stayingReasonOther} />
              </div>
            )}
          </div>
          {conditions.showAcceptingReasons && (
            <div>
              <label className={styles.label}>
                What were your reasons for accepting your first job? Select all
                that apply. *
              </label>
              <div
                data-input-surface
                data-invalid={!!errors.acceptingReasons || undefined}
                className={`${styles.choiceGroup(
                  !!errors.acceptingReasons,
                  readOnly,
                )} grid-cols-1 sm:grid-cols-2`}
              >
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
                      className={styles.choice(
                        !!errors.acceptingReasons,
                        readOnly,
                      )}
                    >
                      <Checkbox
                        disabled={readOnly}
                        aria-invalid={!!errors.acceptingReasons}
                        checked={form.acceptingReasons.includes(
                          r as Survey["acceptingReasons"][number],
                        )}
                        onCheckedChange={() =>
                          toggleList("acceptingReasons", r)
                        }
                      />
                      <span>{r}</span>
                    </label>
                  ))}
              </div>
              <ErrorMessage message={errors.acceptingReasons} />
              {form.acceptingReasons.includes("Others") && (
                <div>
                  <Input
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
                  <ErrorMessage message={errors.acceptingReasonOther} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {conditions.showChangingReasons && (
        <div className="space-y-4 border-t border-border pt-4">
          <div>
            <label className={styles.label}>
              What were your reasons for changing from your first job? Select
              all that apply. *
            </label>
            <div
              data-input-surface
              data-invalid={!!errors.changingReasons || undefined}
              className={`${styles.choiceGroup(
                !!errors.changingReasons,
                readOnly,
              )} grid-cols-1 sm:grid-cols-2`}
            >
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
                    className={styles.choice(
                      !!errors.changingReasons,
                      readOnly,
                    )}
                  >
                    <Checkbox
                      disabled={readOnly}
                      aria-invalid={!!errors.changingReasons}
                      checked={form.changingReasons.includes(
                        r as Survey["changingReasons"][number],
                      )}
                      onCheckedChange={() => toggleList("changingReasons", r)}
                    />
                    <span>{r}</span>
                  </label>
                ))}
            </div>
            <ErrorMessage message={errors.changingReasons} />
            {form.changingReasons.includes("Others") && (
              <div>
                <Input
                  disabled={readOnly}
                  type="text"
                  className={styles.input(
                    !!errors.changingReasonOther,
                    readOnly,
                  )}
                  placeholder="Specify other"
                  value={form.changingReasonOther}
                  onChange={(e) =>
                    updateField("changingReasonOther", e.target.value)
                  }
                />
                <ErrorMessage message={errors.changingReasonOther} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Standard Fields block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-4">
        <div>
          <label className={styles.label}>
            What was the job title of your first job after college? *
          </label>
          <Input
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
            label="How long did it take you to land your first job after college? *"
            value={form.firstJobSearchDuration}
            onChange={(val) =>
              updateField(
                "firstJobSearchDuration",
                val as Survey["firstJobSearchDuration"],
              )
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
              <Input
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
            label="How long did you stay in your first job? *"
            value={form.firstJobDuration}
            onChange={(val) =>
              updateField("firstJobDuration", val as Survey["firstJobDuration"])
            }
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
              <Input
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
            label="How did you find your first job after college? *"
            value={form.firstJobSource}
            onChange={(val) =>
              updateField("firstJobSource", val as Survey["firstJobSource"])
            }
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
              <Input
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
            label="What was your position level in your first job? *"
            value={form.firstJobLevel}
            onChange={(val) =>
              updateField("firstJobLevel", val as Survey["firstJobLevel"])
            }
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
            label="What is your position level in your current or present job? *"
            value={form.currentJobLevel}
            onChange={(val) =>
              updateField("currentJobLevel", val as Survey["currentJobLevel"])
            }
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
            label="What was your initial monthly earning in your first job after college? *"
            value={form.initialMonthlyIncome}
            onChange={(val) =>
              updateField(
                "initialMonthlyIncome",
                val as Survey["initialMonthlyIncome"],
              )
            }
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
      <div className="space-y-4 border-t border-border pt-4">
        <SelectField
          disabled={readOnly}
          id="curriculumRelevant"
          label="Was the curriculum you completed in college relevant to your first job? *"
          value={
            form.curriculumRelevant === true
              ? "true"
              : form.curriculumRelevant === false
                ? "false"
                : ""
          }
          onChange={(val) => {
            const isRelevant = val === "true";
            updateField("curriculumRelevant", isRelevant);
            if (!isRelevant) {
              updateField("usefulCompetencies", []);
              updateField("usefulCompetencyOther", "");
            }
          }}
          options={FORM_OPTIONS.yesNo}
          placeholder="Select"
          required
          hasError={!!errors.curriculumRelevant}
        />
        <ErrorMessage message={errors.curriculumRelevant} />

        {conditions.showUsefulCompetencies && (
          <div>
            <label className={styles.label}>
              Which competencies learned in college did you find most useful in
              your first job? Select all that apply. *
            </label>
            <div
              data-input-surface
              data-invalid={!!errors.usefulCompetencies || undefined}
              className={`${styles.choiceGroup(
                !!errors.usefulCompetencies,
                readOnly,
              )} grid-cols-1 sm:grid-cols-2`}
            >
              {compList.map((c) => (
                <label
                  key={c}
                  className={styles.choice(
                    !!errors.usefulCompetencies,
                    readOnly,
                  )}
                >
                  <Checkbox
                    disabled={readOnly}
                    aria-invalid={!!errors.usefulCompetencies}
                    checked={form.usefulCompetencies.includes(
                      c as Survey["usefulCompetencies"][number],
                    )}
                    onCheckedChange={() => toggleList("usefulCompetencies", c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={errors.usefulCompetencies} />
            {form.usefulCompetencies.includes("Others") && (
              <div className="mt-2">
                <Input
                  disabled={readOnly}
                  type="text"
                  className={styles.input(
                    !!errors.usefulCompetencyOther,
                    readOnly,
                  )}
                  placeholder="Specify other competencies"
                  value={form.usefulCompetencyOther}
                  onChange={(e) =>
                    updateField("usefulCompetencyOther", e.target.value)
                  }
                />
                <ErrorMessage message={errors.usefulCompetencyOther} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
