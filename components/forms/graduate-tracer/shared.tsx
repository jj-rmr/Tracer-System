import type { Survey } from "@/types";
import type { GraduateTracerFieldErrors } from "@/lib/forms/graduate-tracer-validation";
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

export type FormErrors = GraduateTracerFieldErrors;

export interface RhfSectionProps {
  control: Control<Survey>;
  errors: FormErrors;
  readOnly: boolean;
  register: UseFormRegister<Survey>;
  clearFieldError: (field: keyof Survey) => void;
}

export interface RhfBridgeSectionProps {
  control: Control<Survey>;
  errors: FormErrors;
  readOnly: boolean;
  setValue: UseFormSetValue<Survey>;
  clearFieldError: (field: keyof Survey) => void;
}

export interface StepProps {
  form: Survey;
  errors: FormErrors;
  readOnly: boolean;
  updateField: <K extends keyof Survey>(field: K, value: Survey[K]) => void;
}

export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

export const fieldStyles = {
  input: (err: boolean, disabled: boolean) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-border bg-secondary text-muted-foreground shadow-none placeholder:opacity-0"
      : err
        ? "border-destructive bg-destructive/10 text-foreground shadow-sm focus:border-destructive focus:bg-card focus:outline-none focus:ring-4 focus:ring-destructive/20"
        : "border-border bg-muted text-foreground shadow-sm focus:border-ring focus:bg-card focus:outline-none focus:ring-4 focus:ring-ring/30";

    return `w-full rounded-2xl border px-4 py-3 text-sm transition duration-200 placeholder:text-muted-foreground ${stateClass}`;
  },
  choiceGroup: (err: boolean, disabled: boolean) =>
    `grid gap-2 rounded-2xl border p-3 transition duration-200 ${
      disabled
        ? "border-border bg-secondary"
        : err
          ? "border-destructive bg-destructive/10"
          : "border-border bg-muted"
    }`,
  choice: (err: boolean, disabled: boolean) =>
    `flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors duration-200 ${
      disabled
        ? "cursor-not-allowed text-muted-foreground"
        : err
          ? "text-destructive hover:bg-destructive/15"
          : "text-foreground hover:bg-card"
    }`,
  checkbox: (err: boolean) =>
    `h-4 w-4 shrink-0 rounded border accent-primary focus:outline-none focus:ring-4 ${
      err
        ? "border-destructive focus:ring-destructive/20"
        : "border-input focus:ring-ring/30"
    }`,
  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground",
};
