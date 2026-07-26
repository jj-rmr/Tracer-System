import { z } from "zod";

const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

export const graduateTracerPersonalSchema = z.object({
  firstName: requiredText("Please enter your first name."),
  lastName: requiredText("Please enter your last name."),
  barangay: requiredText("Please enter your barangay."),
  municipality: requiredText("Please enter your municipality or city."),
  province: requiredText("Please enter your province."),
  region: requiredText("Please select your region."),
  civilStatus: requiredText("Please select your civil status."),
  sex: requiredText("Please select your sex."),
  contactNumbers: z
    .array(requiredText("Please provide at least one valid contact number."), {
      error: "Please provide at least one valid contact number.",
    })
    .min(1, "Please provide at least one valid contact number."),
});

export const graduateTracerEducationSchema = z
  .object({
    program: requiredText(
      "Please select the degree program you graduated from.",
    ),
    yearGraduated: z
      .number({ error: "Please enter your year of graduation." })
      .int("Please enter a valid graduation year.")
      .min(1900, "Please enter a valid graduation year.")
      .max(new Date().getFullYear(), "Please enter a valid graduation year."),
    advancedStudyDegree: z.unknown().optional(),
    advancedStudyOther: z.unknown().optional(),
    advancedStudyReasons: z.unknown().optional(),
    advancedStudyReasonOther: z.unknown().optional(),
  })
  .superRefine((answers, context) => {
    if (
      answers.advancedStudyDegree === "Others" &&
      (typeof answers.advancedStudyOther !== "string" ||
        !answers.advancedStudyOther.trim())
    ) {
      context.addIssue({
        code: "custom",
        path: ["advancedStudyOther"],
        message: "Please specify your graduate degree.",
      });
    }

    if (
      answers.advancedStudyReasons === "Others" &&
      (typeof answers.advancedStudyReasonOther !== "string" ||
        !answers.advancedStudyReasonOther.trim())
    ) {
      context.addIssue({
        code: "custom",
        path: ["advancedStudyReasonOther"],
        message: "Please specify your reason for pursuing graduate studies.",
      });
    }
  });

const conditionalFields = z.object({
  employmentStatus: z.unknown().optional(),
  currentEmploymentStatus: z.unknown().optional(),
  currentOccupation: z.unknown().optional(),
  companyName: z.unknown().optional(),
  companyAddress: z.unknown().optional(),
  businessIndustry: z.unknown().optional(),
  placeOfWork: z.unknown().optional(),
  unemploymentReasons: z.unknown().optional(),
  unemploymentReasonOther: z.unknown().optional(),
  isFirstJob: z.unknown().optional(),
  isFirstJobRelated: z.unknown().optional(),
  stayingReasons: z.unknown().optional(),
  stayingReasonOther: z.unknown().optional(),
  acceptingReasons: z.unknown().optional(),
  acceptingReasonOther: z.unknown().optional(),
  changingReasons: z.unknown().optional(),
  changingReasonOther: z.unknown().optional(),
  firstJobTitle: z.unknown().optional(),
  firstJobDuration: z.unknown().optional(),
  firstJobDurationOther: z.unknown().optional(),
  firstJobSource: z.unknown().optional(),
  firstJobSourceOther: z.unknown().optional(),
  firstJobSearchDuration: z.unknown().optional(),
  firstJobSearchDurationOther: z.unknown().optional(),
  firstJobLevel: z.unknown().optional(),
  currentJobLevel: z.unknown().optional(),
  initialMonthlyIncome: z.unknown().optional(),
  curriculumRelevant: z.unknown().optional(),
  usefulCompetencies: z.unknown().optional(),
  usefulCompetencyOther: z.unknown().optional(),
});

type ConditionalAnswers = z.infer<typeof conditionalFields>;
type RefinementContext = Parameters<
  Parameters<typeof conditionalFields.superRefine>[0]
>[1];

function addRequiredText(
  context: RefinementContext,
  answers: ConditionalAnswers,
  field: keyof ConditionalAnswers,
  message: string,
) {
  const value = answers[field];
  if (typeof value !== "string" || !value.trim()) {
    context.addIssue({ code: "custom", path: [field], message });
  }
}

function addRequiredList(
  context: RefinementContext,
  answers: ConditionalAnswers,
  field: keyof ConditionalAnswers,
  message: string,
) {
  const value = answers[field];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || !item.trim())
  ) {
    context.addIssue({ code: "custom", path: [field], message });
  }
}

function includes(value: unknown, option: string) {
  return Array.isArray(value) && value.includes(option);
}

export const graduateTracerEmploymentSchema = conditionalFields.superRefine(
  (answers, context) => {
    addRequiredText(
      context,
      answers,
      "employmentStatus",
      "Please select your current employment status.",
    );

    if (answers.employmentStatus === "Yes") {
      addRequiredText(
        context,
        answers,
        "currentEmploymentStatus",
        "Please select your present employment status.",
      );
      addRequiredText(
        context,
        answers,
        "currentOccupation",
        "Please enter your current occupation.",
      );
      addRequiredText(
        context,
        answers,
        "companyName",
        "Please enter your company or employer's name.",
      );
      addRequiredText(
        context,
        answers,
        "companyAddress",
        "Please enter your company or employer's address.",
      );
      addRequiredText(
        context,
        answers,
        "businessIndustry",
        "Please select your employer's industry.",
      );
      addRequiredText(
        context,
        answers,
        "placeOfWork",
        "Please select whether you work locally or abroad.",
      );
    } else if (
      answers.employmentStatus === "No" ||
      answers.employmentStatus === "Never Employed"
    ) {
      addRequiredList(
        context,
        answers,
        "unemploymentReasons",
        "Please select at least one reason for your unemployment.",
      );
      if (includes(answers.unemploymentReasons, "Others")) {
        addRequiredText(
          context,
          answers,
          "unemploymentReasonOther",
          "Please specify your other reason for unemployment.",
        );
      }
    }
  },
);

export const graduateTracerJobHistorySchema = conditionalFields.superRefine(
  (answers, context) => {
    if (answers.employmentStatus === "Never Employed") return;

    if (answers.isFirstJob !== true && answers.isFirstJob !== false) {
      context.addIssue({
        code: "custom",
        path: ["isFirstJob"],
        message:
          "Please indicate whether this is your first job after college.",
      });
    } else if (answers.isFirstJob) {
      addRequiredList(
        context,
        answers,
        "stayingReasons",
        "Please select at least one reason for staying in your first job.",
      );
      if (includes(answers.stayingReasons, "Others")) {
        addRequiredText(
          context,
          answers,
          "stayingReasonOther",
          "Please specify your other reason for staying in your first job.",
        );
      }
      if (
        answers.isFirstJobRelated !== true &&
        answers.isFirstJobRelated !== false
      ) {
        context.addIssue({
          code: "custom",
          path: ["isFirstJobRelated"],
          message:
            "Please indicate whether your first job was related to your degree program.",
        });
      } else if (answers.isFirstJobRelated === false) {
        addRequiredList(
          context,
          answers,
          "acceptingReasons",
          "Please select at least one reason for accepting your first job.",
        );
        if (includes(answers.acceptingReasons, "Others")) {
          addRequiredText(
            context,
            answers,
            "acceptingReasonOther",
            "Please specify your other reason for accepting your first job.",
          );
        }
      }
    } else {
      addRequiredList(
        context,
        answers,
        "changingReasons",
        "Please select at least one reason for changing jobs.",
      );
      if (includes(answers.changingReasons, "Others")) {
        addRequiredText(
          context,
          answers,
          "changingReasonOther",
          "Please specify your other reason for changing jobs.",
        );
      }
    }

    addRequiredText(
      context,
      answers,
      "firstJobTitle",
      "Please enter the title of your first job.",
    );
    addRequiredText(
      context,
      answers,
      "firstJobDuration",
      "Please select how long you stayed in your first job.",
    );
    if (answers.firstJobDuration === "Others")
      addRequiredText(
        context,
        answers,
        "firstJobDurationOther",
        "Please specify the duration of your first job.",
      );
    addRequiredText(
      context,
      answers,
      "firstJobSource",
      "Please select how you found your first job.",
    );
    if (answers.firstJobSource === "Others")
      addRequiredText(
        context,
        answers,
        "firstJobSourceOther",
        "Please specify how you found your first job.",
      );
    addRequiredText(
      context,
      answers,
      "firstJobSearchDuration",
      "Please select how long it took you to find your first job.",
    );
    if (answers.firstJobSearchDuration === "Others")
      addRequiredText(
        context,
        answers,
        "firstJobSearchDurationOther",
        "Please specify how long it took you to find your first job.",
      );
    addRequiredText(
      context,
      answers,
      "firstJobLevel",
      "Please select the level of your first job.",
    );
    addRequiredText(
      context,
      answers,
      "currentJobLevel",
      "Please select your current job level.",
    );
    addRequiredText(
      context,
      answers,
      "initialMonthlyIncome",
      "Please select your initial monthly income range.",
    );
    if (
      answers.curriculumRelevant !== true &&
      answers.curriculumRelevant !== false
    ) {
      context.addIssue({
        code: "custom",
        path: ["curriculumRelevant"],
        message:
          "Please indicate whether your curriculum was relevant to your employment.",
      });
    }
    addRequiredList(
      context,
      answers,
      "usefulCompetencies",
      "Please select at least one competency that has been useful in your career.",
    );
    if (includes(answers.usefulCompetencies, "Others"))
      addRequiredText(
        context,
        answers,
        "usefulCompetencyOther",
        "Please specify the other competency you found useful.",
      );
  },
);
