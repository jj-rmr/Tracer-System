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

export function createMockSurvey(userId: string): Survey {
  return {
    ...defaultSurvey,
    id: "mock-survey-id",
    userId: userId,
    firstName: "Test",
    middleName: "Sample",
    lastName: "User",
    extensionName: "",
    street: "123 Mock Street",
    barangay: "Mock Barangay",
    municipality: "Mock Municipality",
    province: "Mock Province",
    region: "Region IV-A",
    contactNumbers: ["09171234567"],
    civilStatus: "Single",
    sex: "Male",
    program: "Computer Science",
    yearGraduated: 2020,
    honors: ["Cum Laude"],
    trainings: ["Leadership Training"],
    advancedStudyDegree: "",
    advancedStudyOther: "",
    advancedStudyReasons: "",
    advancedStudyReasonOther: "",
    employmentStatus: "Yes",
    unemploymentReasons: [],
    unemploymentReasonOther: "",
    currentEmploymentStatus: "Regular/Permanent",
    currentOccupation: "Software Engineer",
    companyName: "Mock Company",
    companyAddress: "456 Mock Avenue",
    businessIndustry: "Education",
    placeOfWork: "Local",
    graduateFolderId: "",
    documents: [],
    isFirstJob: false,
    isFirstJobRelated: true,
    stayingReasons: [],
    stayingReasonOther: "",
    acceptingReasons: [],
    acceptingReasonOther: "",
    changingReasons: [],
    changingReasonOther: "",
    firstJobDuration: "1-2 years",
    firstJobDurationOther: "",
    firstJobSource: "Recommended",
    firstJobSourceOther: "",
    firstJobSearchDuration: "1-6 months",
    firstJobSearchDurationOther: "",
    firstJobTitle: "Junior Engineer",
    firstJobLevel: "Professional/Technical/Supervisory",
    currentJobLevel: "Professional/Technical/Supervisory",
    initialMonthlyIncome: "10000-14999",
    curriculumRelevant: true,
    usefulCompetencies: ["Communication Skills"],
    usefulCompetencyOther: "",
  };
}

export function createMockSurveyDocument() {
  return {
    id: "mock-document-id",
    filename: "mock-document.pdf",
    mimeType: "application/pdf",
    size: 1024,
    googleDriveFileId: "mock-drive-file-id",
    googleDriveFolderId: "mock-drive-folder-id",
    uploadedAt: new Date().toISOString(),
    metadata: {
      filename: "mock-document.pdf",
      mimeType: "application/pdf",
      size: 1024,
      googleDriveFileId: "mock-drive-file-id",
      googleDriveFolderId: "mock-drive-folder-id",
      uploadedAt: new Date().toISOString(),
      source: "mock",
    },
  };
}
