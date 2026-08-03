import { Input } from "@/components/ui/input";

import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";

import { SelectField } from "@/components/forms/SelectField";
import { StringListField } from "@/components/forms/StringListField";
import {
  CAMPUSES,
  getCollegesForCampus,
  getProgramsForCollege,
  PROGRAM_FOLDER_MAP,
  PROGRAMS,
} from "@/lib/programs/catalog";
import {
  ErrorMessage,
  fieldStyles as styles,
  type RhfSectionProps,
} from "./shared";

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, index) => {
    const year = CURRENT_YEAR - index;
    return { value: String(year), label: String(year) };
  },
);

export function EducationSection({
  control,
  errors,
  readOnly,
  register,
  clearFieldError,
  allowedProgramValues,
}: RhfSectionProps & { allowedProgramValues?: string[] | null }) {
  const advancedStudyDegree = useWatch({
    control,
    name: "advancedStudyDegree",
  });
  const advancedStudyReasons = useWatch({
    control,
    name: "advancedStudyReasons",
  });
  const selectedProgram = useWatch({ control, name: "program" });
  const selectedOrganization = PROGRAM_FOLDER_MAP[selectedProgram];
  const [campusOverride, setCampusOverride] = useState<string | null>(null);
  const [collegeOverride, setCollegeOverride] = useState<string | null>(null);
  const campus = campusOverride ?? selectedOrganization?.campus ?? "";
  const college = collegeOverride ?? selectedOrganization?.college ?? "";

  const allowedPrograms = allowedProgramValues
    ? new Set(allowedProgramValues)
    : null;
  const campusOptions = allowedPrograms
    ? CAMPUSES.filter((option) =>
        PROGRAMS.some(
          (program) =>
            allowedPrograms.has(program.value) &&
            PROGRAM_FOLDER_MAP[program.value]?.campus === option.value,
        ),
      )
    : CAMPUSES;
  const collegeOptions = getCollegesForCampus(campus).filter(
    (option) =>
      !allowedPrograms ||
      PROGRAMS.some(
        (program) =>
          allowedPrograms.has(program.value) &&
          PROGRAM_FOLDER_MAP[program.value]?.campus === campus &&
          PROGRAM_FOLDER_MAP[program.value]?.college === option.value,
      ),
  );
  const programOptions = getProgramsForCollege(campus, college).filter(
    (option) => !allowedPrograms || allowedPrograms.has(option.value),
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">
        Academic Background
      </h3>

      <div className="space-y-6 border-b border-border pb-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Controller
            name="program"
            control={control}
            render={({ field }) => (
              <>
                <SelectField
                  id="campus"
                  disabled={readOnly}
                  label="Campus *"
                  value={campus}
                  onChange={(value) => {
                    setCampusOverride(value);
                    setCollegeOverride("");
                    field.onChange("");
                  }}
                  options={campusOptions}
                  hasError={!!errors.program && !campus}
                  required
                  placeholder="Select your campus"
                />

                {campus && (
                  <SelectField
                    id="college"
                    disabled={readOnly}
                    label="College *"
                    value={college}
                    onChange={(value) => {
                      setCollegeOverride(value);
                      field.onChange("");
                    }}
                    options={collegeOptions}
                    hasError={!!errors.program && !college}
                    required
                    placeholder="Select your college"
                  />
                )}

                {campus && college && (
                  <SelectField
                    id="program"
                    disabled={readOnly}
                    label="Program *"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value) clearFieldError("program");
                    }}
                    options={programOptions}
                    hasError={!!errors.program}
                    required
                    placeholder="Select your program of study"
                  />
                )}
              </>
            )}
          />
          <ErrorMessage message={errors.program} />
        </div>

        <div className="max-w-md">
          <Controller
            name="yearGraduated"
            control={control}
            render={({ field }) => (
              <SelectField
                id="yearGraduated"
                label="Year Graduated *"
                value={String(field.value)}
                onChange={(value) => {
                  if (!value) return;
                  field.onChange(Number(value));
                  clearFieldError("yearGraduated");
                }}
                options={GRADUATION_YEAR_OPTIONS}
                disabled={readOnly}
                required
                hasError={!!errors.yearGraduated}
                placeholder="Select graduation year"
                inputMode="numeric"
                numericOnly
              />
            )}
          />
          <ErrorMessage message={errors.yearGraduated} />
        </div>
      </div>

      <Controller
        name="honors"
        control={control}
        render={({ field }) => (
          <StringListField
            value={field.value}
            onChange={field.onChange}
            label="Academic Honors / Awards Received"
            fieldName="honors"
            addButtonLabel="Add Honor / Award"
            placeholder="e.g. Cum Laude"
            readOnly={readOnly}
          />
        )}
      />

      <Controller
        name="trainings"
        control={control}
        render={({ field }) => (
          <StringListField
            value={field.value}
            onChange={field.onChange}
            label="Professional Trainings Attended"
            fieldName="trainings"
            addButtonLabel="Add Training"
            placeholder="e.g. Web Development Bootcamp"
            readOnly={readOnly}
          />
        )}
      />

      <div className="grid grid-cols-1 gap-6 border-t border-border pt-4 md:grid-cols-2">
        <Controller
          name="advancedStudyDegree"
          control={control}
          render={({ field }) => (
            <SelectField
              disabled={readOnly}
              id="advancedStudyDegree"
              label="Advanced Graduate Studies Degree"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "", label: "None" },
                { value: "MS", label: "MS" },
                { value: "MA", label: "MA" },
                { value: "Others", label: "Others" },
              ]}
              placeholder="None"
            />
          )}
        />

        {advancedStudyDegree && (
          <Controller
            name="advancedStudyReasons"
            control={control}
            render={({ field }) => (
              <SelectField
                disabled={readOnly}
                id="advancedStudyReasons"
                label="Reason for Pursuing Graduate Studies"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "For Promotion", label: "For Promotion" },
                  {
                    value: "Professional Development",
                    label: "Professional Development",
                  },
                  { value: "Others", label: "Others" },
                ]}
                placeholder="None"
              />
            )}
          />
        )}
      </div>

      {advancedStudyDegree === "Others" && (
        <div>
          <label className={styles.label}>Specify Advanced Degree *</label>
          <Input
            {...register("advancedStudyOther", {
              onChange: () => clearFieldError("advancedStudyOther"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.advancedStudyOther, readOnly)}
          />
          <ErrorMessage message={errors.advancedStudyOther} />
        </div>
      )}

      {advancedStudyReasons === "Others" && (
        <div>
          <label className={styles.label}>Specify Reason *</label>
          <Input
            {...register("advancedStudyReasonOther", {
              onChange: () => clearFieldError("advancedStudyReasonOther"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(
              !!errors.advancedStudyReasonOther,
              readOnly,
            )}
          />
          <ErrorMessage message={errors.advancedStudyReasonOther} />
        </div>
      )}
    </div>
  );
}
