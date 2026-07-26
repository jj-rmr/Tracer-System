import { Input } from "@/components/ui/input";

import { Controller } from "react-hook-form";

import { SelectField } from "@/components/forms/SelectField";
import { StringListField } from "@/components/forms/StringListField";
import { graduateTracerV1 } from "@/lib/forms/registry";
import {
  ErrorMessage,
  fieldStyles as styles,
  type RhfSectionProps,
} from "./shared";

const FORM_OPTIONS = graduateTracerV1.optionSets;

export function PersonalInfoSection({
  control,
  errors,
  readOnly,
  register,
  clearFieldError,
}: RhfSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">
        Personal & Contact Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className={styles.label}>First Name *</label>
          <Input
            {...register("firstName", {
              onChange: () => clearFieldError("firstName"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.firstName, readOnly)}
          />
          <ErrorMessage message={errors.firstName} />
        </div>
        <div>
          <label className={styles.label}>Middle Name</label>
          <Input
            {...register("middleName")}
            disabled={readOnly}
            type="text"
            className={styles.input(false, readOnly)}
          />
        </div>
        <div>
          <label className={styles.label}>Last Name *</label>
          <Input
            {...register("lastName", {
              onChange: () => clearFieldError("lastName"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.lastName, readOnly)}
          />
          <ErrorMessage message={errors.lastName} />
        </div>
        <div>
          <label className={styles.label}>Extension Name</label>
          <Input
            {...register("extensionName")}
            disabled={readOnly}
            type="text"
            className={styles.input(false, readOnly)}
            placeholder="e.g. Jr., III"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={styles.label}>Street</label>
          <Input
            {...register("street")}
            disabled={readOnly}
            type="text"
            className={styles.input(false, readOnly)}
          />
          <ErrorMessage message={errors.street} />
        </div>
        <div>
          <label className={styles.label}>Barangay *</label>
          <Input
            {...register("barangay", {
              onChange: () => clearFieldError("barangay"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.barangay, readOnly)}
          />
          <ErrorMessage message={errors.barangay} />
        </div>
        <div>
          <label className={styles.label}>Municipality *</label>
          <Input
            {...register("municipality", {
              onChange: () => clearFieldError("municipality"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.municipality, readOnly)}
          />
          <ErrorMessage message={errors.municipality} />
        </div>
        <div>
          <label className={styles.label}>Province *</label>
          <Input
            {...register("province", {
              onChange: () => clearFieldError("province"),
            })}
            disabled={readOnly}
            type="text"
            className={styles.input(!!errors.province, readOnly)}
          />
          <ErrorMessage message={errors.province} />
        </div>
        <div>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <SelectField
                disabled={readOnly}
                id="region"
                label="Region *"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearFieldError("region");
                }}
                options={[
                  { value: "NCR", label: "National Capital Region (NCR)" },
                  {
                    value: "CAR",
                    label: "Cordillera Administrative Region (CAR)",
                  },
                  { value: "Region I", label: "Region I (Ilocos Region)" },
                  { value: "Region II", label: "Region II (Cagayan Valley)" },
                  { value: "Region III", label: "Region III (Central Luzon)" },
                  { value: "Region IV-A", label: "Region IV-A (CALABARZON)" },
                  { value: "MIMAROPA", label: "MIMAROPA Region" },
                  { value: "Region V", label: "Region V (Bicol Region)" },
                  { value: "Region VI", label: "Region VI (Western Visayas)" },
                  {
                    value: "Region VII",
                    label: "Region VII (Central Visayas)",
                  },
                  {
                    value: "Region VIII",
                    label: "Region VIII (Eastern Visayas)",
                  },
                  {
                    value: "Region IX",
                    label: "Region IX (Zamboanga Peninsula)",
                  },
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
            )}
          />
          <ErrorMessage message={errors.region} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Controller
            name="civilStatus"
            control={control}
            render={({ field }) => (
              <SelectField
                disabled={readOnly}
                id="civilStatus"
                label="Civil Status *"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearFieldError("civilStatus");
                }}
                options={FORM_OPTIONS.civilStatus}
                placeholder="Select"
                required
                hasError={!!errors.civilStatus}
              />
            )}
          />
          <ErrorMessage message={errors.civilStatus} />
        </div>
        <div>
          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <SelectField
                disabled={readOnly}
                id="sex"
                label="Sex *"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearFieldError("sex");
                }}
                options={FORM_OPTIONS.sex}
                placeholder="Select"
                required
                hasError={!!errors.sex}
              />
            )}
          />
          <ErrorMessage message={errors.sex} />
        </div>
      </div>

      <div className="space-y-3">
        <Controller
          name="contactNumbers"
          control={control}
          render={({ field }) => (
            <StringListField
              value={field.value}
              onChange={(items) => {
                field.onChange(items);
                clearFieldError("contactNumbers");
              }}
              label="Contact Numbers"
              fieldName="contactNumbers"
              addButtonLabel="Add Contact Number"
              placeholder="09XXXXXXXXX"
              required
              readOnly={readOnly}
              hasError={!!errors.contactNumbers}
            />
          )}
        />
        <ErrorMessage message={errors.contactNumbers} />
      </div>
    </div>
  );
}
