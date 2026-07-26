"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  name = id,
  description,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  hasError = false,
  errorMessage,
}: SelectFieldProps) {
  const selectedOption =
    options.find((option) => option.value === value) ?? null;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const isInvalid = hasError || Boolean(errorMessage);
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="relative flex w-full min-w-0 flex-col">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>

      {description && (
        <p
          id={descriptionId}
          className="mb-2 text-xs leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      )}

      <Combobox
        items={options}
        value={selectedOption}
        onValueChange={(option) => onChange(option?.value ?? "")}
        itemToStringLabel={(option) => option.label}
        itemToStringValue={(option) => option.value}
        isItemEqualToValue={(option, selected) =>
          option.value === selected.value
        }
        name={name}
        disabled={disabled}
        required={required}
      >
        <ComboboxInput
          id={id}
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={isInvalid || undefined}
          aria-required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
        <ComboboxContent aria-label={label}>
          <ComboboxEmpty>No matching options</ComboboxEmpty>
          <ComboboxList>
            {(option: SelectOption) => (
              <ComboboxItem
                key={option.value}
                value={option}
                disabled={option.disabled}
              >
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-xs font-medium text-destructive"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
