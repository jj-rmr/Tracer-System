import { Controller, useWatch } from "react-hook-form";

import { SelectField } from "@/components/forms/SelectField";
import { StringListField } from "@/components/forms/StringListField";
import { PROGRAMS } from "@/lib/programs/catalog";
import {
  ErrorMessage,
  fieldStyles as styles,
  type RhfSectionProps,
} from "./shared";

export function EducationSection({
  control,
  errors,
  readOnly,
  register,
  clearFieldError,
}: RhfSectionProps) {
  const advancedStudyDegree = useWatch({
    control,
    name: "advancedStudyDegree",
  });
  const advancedStudyReasons = useWatch({
    control,
    name: "advancedStudyReasons",
  });

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900">Academic Background</h3>

      <div className="grid grid-cols-1 gap-6 border-b border-slate-100 pb-4 md:grid-cols-2">
        <div>
          <Controller
            name="program"
            control={control}
            render={({ field }) => (
              <SelectField
                id="program"
                disabled={readOnly}
                label="Program *"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearFieldError("program");
                }}
                options={PROGRAMS}
                hasError={!!errors.program}
                required
                placeholder="Select your program of study"
              />
            )}
          />
          <ErrorMessage message={errors.program} />
        </div>

        <div>
          <label className={styles.label}>Year Graduated *</label>
          <input
            {...register("yearGraduated", {
              valueAsNumber: true,
              onChange: () => clearFieldError("yearGraduated"),
            })}
            disabled={readOnly}
            type="number"
            className={styles.input(!!errors.yearGraduated, readOnly)}
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

      <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-4 md:grid-cols-2">
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
          <input
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
          <input
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
