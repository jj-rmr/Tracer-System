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
    <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
      {message}
    </p>
  );
}

export const fieldStyles = {
  input: (err: boolean, disabled: boolean) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 shadow-none placeholder:opacity-0"
      : err
        ? "border-rose-400 bg-rose-50/60 text-slate-900 shadow-sm focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100"
        : "border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100";

    return `w-full rounded-2xl border px-4 py-3 text-sm transition duration-200 placeholder:text-slate-400 ${stateClass}`;
  },
  choiceGroup: (err: boolean, disabled: boolean) =>
    `grid gap-2 rounded-2xl border p-3 transition duration-200 ${
      disabled
        ? "border-slate-200 bg-slate-100"
        : err
          ? "border-rose-400 bg-rose-50/60"
          : "border-slate-200 bg-slate-50"
    }`,
  choice: (err: boolean, disabled: boolean) =>
    `flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors ${
      disabled
        ? "cursor-not-allowed text-slate-500"
        : err
          ? "text-rose-900 hover:bg-rose-100/70"
          : "text-slate-700 hover:bg-white"
    }`,
  checkbox: (err: boolean) =>
    `h-4 w-4 shrink-0 rounded border accent-sky-600 focus:outline-none focus:ring-4 ${
      err
        ? "border-rose-400 focus:ring-rose-100"
        : "border-slate-300 focus:ring-sky-100"
    }`,
  label: "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600",
};
