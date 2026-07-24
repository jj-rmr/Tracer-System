import { Survey } from "@/types";

export const defaultSurvey: Survey = {
  id: "",

  createdAt: "",
  updatedAt: "",

  userId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  extensionName: "",

  street: "",
  barangay: "",
  municipality: "",
  province: "",
  region: "",

  contactNumbers: [],

  civilStatus: "Single",
  sex: "",

  program: "",
  yearGraduated: new Date().getFullYear(),

  honors: [],
  trainings: [],

  advancedStudyDegree: "",
  advancedStudyOther: "",
  advancedStudyReasons: "",
  advancedStudyReasonOther: "",

  employmentStatus: "",

  unemploymentReasons: [],
  unemploymentReasonOther: "",

  currentEmploymentStatus: "",
  currentOccupation: "",

  companyName: "",
  companyAddress: "",

  businessIndustry: "",
  placeOfWork: "",

  graduateFolderId: "",
  documents: [],

  isFirstJob: null,
  isFirstJobRelated: null,

  stayingReasons: [],
  stayingReasonOther: "",

  acceptingReasons: [],
  acceptingReasonOther: "",

  changingReasons: [],
  changingReasonOther: "",

  firstJobDuration: "",
  firstJobDurationOther: "",

  firstJobSource: "",
  firstJobSourceOther: "",

  firstJobSearchDuration: "",
  firstJobSearchDurationOther: "",

  firstJobTitle: "",

  firstJobLevel: "",
  currentJobLevel: "",

  initialMonthlyIncome: "",

  curriculumRelevant: null,

  usefulCompetencies: [],
  usefulCompetencyOther: "",
};
