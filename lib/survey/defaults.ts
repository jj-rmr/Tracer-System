import { Survey } from "@/types/survey";

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

  yearGraduated: new Date().getFullYear(),

  honors: [],
  trainings: [],

  advanceStudyDegree: "",
  advanceStudyOther: "",
  advanceStudyReasons: "",
  advanceStudyReasonOther: "",

  employmentStatus: "",

  unemploymentReasons: [],
  unemploymentReasonOther: "",

  presentEmploymentStatus: "",
  presentOccupation: "",

  companyName: "",
  companyAddress: "",

  businessIndustry: "",
  placeOfWork: "",

  employmentDocuments: [],
  awardDocuments: [],

  isFirstJob: false,
  isFirstJobRelated: false,

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

  curriculumRelevant: false,

  usefulCompetencies: [],
  usefulCompetencyOther: "",
};
