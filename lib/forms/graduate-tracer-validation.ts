import type { Survey } from "@/types";

export type GraduateTracerFieldErrors = Partial<
  Record<keyof Survey, string>
>;
type GraduateTracerAnswers = Partial<Record<keyof Survey, unknown>>;

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasSelection(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

function hasBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

function hasNonEmptyTextList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => hasText(item))
  );
}

function includesSelection(value: unknown, selection: string): boolean {
  return Array.isArray(value) && value.includes(selection);
}

export function getGraduateTracerConditionalSections(form: GraduateTracerAnswers) {
  const hasJobHistory = form.employmentStatus !== "Never Employed";
  const hasFirstJob = hasJobHistory && form.isFirstJob === true;

  return {
    hasJobHistory,
    showEmployedFields: form.employmentStatus === "Yes",
    showUnemploymentReasons:
      form.employmentStatus === "No" ||
      form.employmentStatus === "Never Employed",
    showFirstJobRelated: hasFirstJob,
    showStayingReasons: hasFirstJob,
    showAcceptingReasons: hasFirstJob && form.isFirstJobRelated === false,
    showChangingReasons: hasJobHistory && form.isFirstJob === false,
  };
}

export function validateGraduateTracerStep(
  form: GraduateTracerAnswers,
  currentStep: number,
): GraduateTracerFieldErrors {
  const errors: GraduateTracerFieldErrors = {};
  const conditions = getGraduateTracerConditionalSections(form);

  if (currentStep === 1) {
    if (!hasText(form.firstName))
      errors.firstName = "Please enter your first name.";
    if (!hasText(form.lastName))
      errors.lastName = "Please enter your last name.";
    if (!hasText(form.barangay))
      errors.barangay = "Please enter your barangay.";
    if (!hasText(form.municipality))
      errors.municipality = "Please enter your municipality or city.";
    if (!hasText(form.province))
      errors.province = "Please enter your province.";
    if (!hasText(form.region)) errors.region = "Please select your region.";
    if (!hasSelection(form.civilStatus))
      errors.civilStatus = "Please select your civil status.";
    if (!hasSelection(form.sex)) errors.sex = "Please select your sex.";
    if (!hasNonEmptyTextList(form.contactNumbers)) {
      errors.contactNumbers =
        "Please provide at least one valid contact number.";
    }
  }

  if (currentStep === 2) {
    if (!hasSelection(form.program)) {
      errors.program = "Please select the degree program you graduated from.";
    }

    if (typeof form.yearGraduated !== "number") {
      errors.yearGraduated = "Please enter your year of graduation.";
    } else if (
      !Number.isInteger(form.yearGraduated) ||
      form.yearGraduated < 1900 ||
      form.yearGraduated > new Date().getFullYear()
    ) {
      errors.yearGraduated = "Please enter a valid graduation year.";
    }

    if (
      form.advancedStudyDegree === "Others" &&
      !hasText(form.advancedStudyOther)
    ) {
      errors.advancedStudyOther = "Please specify your graduate degree.";
    }
    if (
      form.advancedStudyReasons === "Others" &&
      !hasText(form.advancedStudyReasonOther)
    ) {
      errors.advancedStudyReasonOther =
        "Please specify your reason for pursuing graduate studies.";
    }
  }

  if (currentStep === 3) {
    if (!hasSelection(form.employmentStatus)) {
      errors.employmentStatus =
        "Please select your current employment status.";
    }

    if (conditions.showEmployedFields) {
      if (!hasSelection(form.currentEmploymentStatus)) {
        errors.currentEmploymentStatus =
          "Please select your present employment status.";
      }
      if (!hasText(form.currentOccupation))
        errors.currentOccupation = "Please enter your current occupation.";
      if (!hasText(form.companyName)) {
        errors.companyName = "Please enter your company or employer's name.";
      }
      if (!hasText(form.companyAddress)) {
        errors.companyAddress =
          "Please enter your company or employer's address.";
      }
      if (!hasSelection(form.businessIndustry)) {
        errors.businessIndustry = "Please select your employer's industry.";
      }
      if (!hasSelection(form.placeOfWork)) {
        errors.placeOfWork =
          "Please select whether you work locally or abroad.";
      }
    } else if (conditions.showUnemploymentReasons) {
      if (!hasNonEmptyTextList(form.unemploymentReasons)) {
        errors.unemploymentReasons =
          "Please select at least one reason for your unemployment.";
      }
      if (
        includesSelection(form.unemploymentReasons, "Others") &&
        !hasText(form.unemploymentReasonOther)
      ) {
        errors.unemploymentReasonOther =
          "Please specify your other reason for unemployment.";
      }
    }
  }

  if (currentStep === 4 && conditions.hasJobHistory) {
    if (!hasBoolean(form.isFirstJob)) {
      errors.isFirstJob =
        "Please indicate whether this is your first job after college.";
    } else {
      if (conditions.showStayingReasons) {
        if (!hasNonEmptyTextList(form.stayingReasons)) {
          errors.stayingReasons =
            "Please select at least one reason for staying in your first job.";
        }
        if (
          includesSelection(form.stayingReasons, "Others") &&
          !hasText(form.stayingReasonOther)
        ) {
          errors.stayingReasonOther =
            "Please specify your other reason for staying in your first job.";
        }
        if (
          conditions.showFirstJobRelated &&
          !hasBoolean(form.isFirstJobRelated)
        ) {
          errors.isFirstJobRelated =
            "Please indicate whether your first job was related to your degree program.";
        }
        if (conditions.showAcceptingReasons) {
          if (!hasNonEmptyTextList(form.acceptingReasons)) {
            errors.acceptingReasons =
              "Please select at least one reason for accepting your first job.";
          }
          if (
            includesSelection(form.acceptingReasons, "Others") &&
            !hasText(form.acceptingReasonOther)
          ) {
            errors.acceptingReasonOther =
              "Please specify your other reason for accepting your first job.";
          }
        }
      }

      if (conditions.showChangingReasons) {
        if (!hasNonEmptyTextList(form.changingReasons)) {
          errors.changingReasons =
            "Please select at least one reason for changing jobs.";
        }
        if (
          includesSelection(form.changingReasons, "Others") &&
          !hasText(form.changingReasonOther)
        ) {
          errors.changingReasonOther =
            "Please specify your other reason for changing jobs.";
        }
      }
    }

    if (!hasText(form.firstJobTitle))
      errors.firstJobTitle = "Please enter the title of your first job.";
    if (!hasSelection(form.firstJobDuration)) {
      errors.firstJobDuration =
        "Please select how long you stayed in your first job.";
    }
    if (
      form.firstJobDuration === "Others" &&
      !hasText(form.firstJobDurationOther)
    ) {
      errors.firstJobDurationOther =
        "Please specify the duration of your first job.";
    }
    if (!hasSelection(form.firstJobSource)) {
      errors.firstJobSource = "Please select how you found your first job.";
    }
    if (
      form.firstJobSource === "Others" &&
      !hasText(form.firstJobSourceOther)
    ) {
      errors.firstJobSourceOther = "Please specify how you found your first job.";
    }
    if (!hasSelection(form.firstJobSearchDuration)) {
      errors.firstJobSearchDuration =
        "Please select how long it took you to find your first job.";
    }
    if (
      form.firstJobSearchDuration === "Others" &&
      !hasText(form.firstJobSearchDurationOther)
    ) {
      errors.firstJobSearchDurationOther =
        "Please specify how long it took you to find your first job.";
    }
    if (!hasSelection(form.firstJobLevel)) {
      errors.firstJobLevel = "Please select the level of your first job.";
    }
    if (!hasSelection(form.currentJobLevel)) {
      errors.currentJobLevel = "Please select your current job level.";
    }
    if (!hasSelection(form.initialMonthlyIncome)) {
      errors.initialMonthlyIncome =
        "Please select your initial monthly income range.";
    }
    if (!hasBoolean(form.curriculumRelevant)) {
      errors.curriculumRelevant =
        "Please indicate whether your curriculum was relevant to your employment.";
    }
    if (!hasNonEmptyTextList(form.usefulCompetencies)) {
      errors.usefulCompetencies =
        "Please select at least one competency that has been useful in your career.";
    }
    if (
      includesSelection(form.usefulCompetencies, "Others") &&
      !hasText(form.usefulCompetencyOther)
    ) {
      errors.usefulCompetencyOther =
        "Please specify the other competency you found useful.";
    }
  }

  return errors;
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
