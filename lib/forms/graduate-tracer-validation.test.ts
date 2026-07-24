import assert from "node:assert/strict";
import test from "node:test";

import {
  validateGraduateTracerStep,
  validateGraduateTracerSurvey,
} from "./graduate-tracer-validation.ts";

function validAnswers() {
  return {
    firstName: "Juan",
    lastName: "Dela Cruz",
    barangay: "San Roque",
    municipality: "Goa",
    province: "Camarines Sur",
    region: "Region V",
    civilStatus: "Single",
    sex: "Male",
    contactNumbers: ["09123456789"],
    program: "BSIT",
    yearGraduated: 2025,
    advancedStudyDegree: "",
    advancedStudyReasons: "",
    employmentStatus: "Yes",
    currentEmploymentStatus: "Regular/Permanent",
    currentOccupation: "Developer",
    companyName: "Example Company",
    companyAddress: "Naga City",
    businessIndustry: "Education",
    placeOfWork: "Local",
    unemploymentReasons: [],
    isFirstJob: true,
    isFirstJobRelated: true,
    stayingReasons: ["Related to Course"],
    acceptingReasons: [],
    changingReasons: [],
    firstJobTitle: "Developer",
    firstJobDuration: "1-2 years",
    firstJobSource: "School Placement",
    firstJobSearchDuration: "1-6 months",
    firstJobLevel: "Professional/Technical/Supervisory",
    currentJobLevel: "Professional/Technical/Supervisory",
    initialMonthlyIncome: "15000-19999",
    curriculumRelevant: true,
    usefulCompetencies: ["Problem Solving Skills"],
  };
}

test("accepts a complete employed and related first-job response", () => {
  assert.equal(validateGraduateTracerSurvey(validAnswers()).valid, true);
});

test("requires accepting reasons only for an unrelated first job", () => {
  const answers = {
    ...validAnswers(),
    isFirstJobRelated: false,
    acceptingReasons: [],
  };

  const result = validateGraduateTracerStep(answers, 4);

  assert.equal(typeof result.acceptingReasons, "string");
  assert.equal(result.changingReasons, undefined);
});

test("requires changing reasons only when the current job is not the first", () => {
  const answers = {
    ...validAnswers(),
    isFirstJob: false,
    isFirstJobRelated: null,
    stayingReasons: [],
    changingReasons: [],
  };

  const result = validateGraduateTracerStep(answers, 4);

  assert.equal(typeof result.changingReasons, "string");
  assert.equal(result.stayingReasons, undefined);
  assert.equal(result.acceptingReasons, undefined);
});

test("skips job-history requirements for a never-employed respondent", () => {
  const answers = {
    ...validAnswers(),
    employmentStatus: "Never Employed",
    unemploymentReasons: ["No Job Opportunity"],
    isFirstJob: null,
    isFirstJobRelated: null,
    stayingReasons: [],
    firstJobTitle: "",
    firstJobDuration: "",
    firstJobSource: "",
    firstJobSearchDuration: "",
    firstJobLevel: "",
    currentJobLevel: "",
    initialMonthlyIncome: "",
    curriculumRelevant: null,
    usefulCompetencies: [],
  };

  assert.deepEqual(validateGraduateTracerStep(answers, 4), {});
  assert.equal(validateGraduateTracerSurvey(answers).valid, true);
});

test("does not validate hidden unemployment reasons before status selection", () => {
  const result = validateGraduateTracerStep(
    { employmentStatus: "", unemploymentReasons: [] },
    3,
  );

  assert.equal(typeof result.employmentStatus, "string");
  assert.equal(result.unemploymentReasons, undefined);
});

test("returns field errors instead of throwing for malformed answer types", () => {
  const malformed = {
    firstName: 42,
    contactNumbers: "not-an-array",
    yearGraduated: "2025",
  } as never;

  const result = validateGraduateTracerSurvey(malformed);

  assert.equal(result.valid, false);
  assert.equal(typeof result.errors.firstName, "string");
  assert.equal(typeof result.errors.contactNumbers, "string");
  assert.equal(typeof result.errors.yearGraduated, "string");
});
