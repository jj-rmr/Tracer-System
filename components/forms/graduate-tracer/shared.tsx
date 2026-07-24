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
  return <p className="mt-1.5 text-xs font-medium text-rose-500">{message}</p>;
}

export const fieldStyles = {
  input: (err: boolean, disabled: boolean) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 shadow-none placeholder:opacity-0"
      : "focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm text-slate-900";

    return `w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition duration-200 placeholder:text-slate-400 ${stateClass} ${err && !disabled ? "border-rose-400 focus:ring-rose-100" : ""}`;
  },
  label: "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600",
};
