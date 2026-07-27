import type { Survey } from "@/types";
import {
  graduateTracerEducationSchema,
  graduateTracerEmploymentSchema,
  graduateTracerJobHistorySchema,
  graduateTracerPersonalSchema,
} from "./graduate-tracer-schema.ts";
import type { ZodError } from "zod";

export type GraduateTracerFieldErrors = Partial<Record<keyof Survey, string>>;
type GraduateTracerAnswers = Partial<Record<keyof Survey, unknown>>;

function getZodFieldErrors(error: ZodError): GraduateTracerFieldErrors {
  return Object.fromEntries(
    error.issues
      .filter((issue) => typeof issue.path[0] === "string")
      .map((issue) => [issue.path[0], issue.message]),
  ) as GraduateTracerFieldErrors;
}

export function getGraduateTracerConditionalSections(
  form: GraduateTracerAnswers,
) {
  const hasJobHistory = form.employmentStatus === "Yes";
  const hasFirstJob = hasJobHistory && form.isFirstJob === true;

  return {
    hasJobHistory,
    showEmployedFields: form.employmentStatus === "Yes",
    showUnemploymentReasons:
      form.employmentStatus === "No" ||
      form.employmentStatus === "Never Employed",
    showFirstJobRelated: hasFirstJob,
    showStayingReasons: hasFirstJob,
    showAcceptingReasons: hasFirstJob && form.isFirstJobRelated === true,
    showUsefulCompetencies: hasJobHistory && form.curriculumRelevant === true,
    showChangingReasons:
      hasJobHistory &&
      (form.isFirstJob === false ||
        (hasFirstJob && form.isFirstJobRelated === false)),
  };
}

export function validateGraduateTracerStep(
  form: GraduateTracerAnswers,
  currentStep: number,
): GraduateTracerFieldErrors {
  if (currentStep === 1) {
    const result = graduateTracerPersonalSchema.safeParse(form);
    return result.success ? {} : getZodFieldErrors(result.error);
  }

  if (currentStep === 2) {
    const result = graduateTracerEducationSchema.safeParse(form);
    return result.success ? {} : getZodFieldErrors(result.error);
  }

  if (currentStep === 3) {
    const result = graduateTracerEmploymentSchema.safeParse(form);
    return result.success ? {} : getZodFieldErrors(result.error);
  }

  if (currentStep === 4) {
    const result = graduateTracerJobHistorySchema.safeParse(form);
    return result.success ? {} : getZodFieldErrors(result.error);
  }

  return {};
}

export function validateGraduateTracerSurvey(form: GraduateTracerAnswers) {
  const errorsByStep = [1, 2, 3, 4].map((currentStep) => ({
    currentStep,
    errors: validateGraduateTracerStep(form, currentStep),
  }));
  const errors = Object.assign(
    {},
    ...errorsByStep.map(({ errors: stepErrors }) => stepErrors),
  ) as GraduateTracerFieldErrors;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    errorsByStep,
  };
}
