import { UUID } from "crypto";

export interface Survey {
  // Ownership
  userId: string;
  id: string;

  createdAt?: string;
  updatedAt?: string;
  // Name
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;

  // Address
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;

  // Contact
  contactNumbers: string[];

  // Personal
  civilStatus: CivilStatus;
  sex: Sex;

  // Education
  yearGraduated: number;

  honors: string[];
  trainings: string[];

  // Graduate Studies
  advanceStudyDegree: AdvanceStudyDegree;
  advanceStudyOther: string;

  advanceStudyReasons: AdvanceStudyReason;
  advanceStudyReasonOther: string;

  // Employment
  employmentStatus: EmploymentStatus;

  unemploymentReasons: UnemploymentReason[];
  unemploymentReasonOther: string;

  presentEmploymentStatus: PresentEmploymentStatus;

  presentOccupation: string;

  companyName: string;
  companyAddress: string;

  businessIndustry: BusinessIndustry;

  placeOfWork: PlaceOfWork;

  employmentDocuments: string[];
  awardDocuments: string[];

  // First Job
  isFirstJob: boolean;
  isFirstJobRelated: boolean;

  stayingReasons: StayingReason[];
  stayingReasonOther: string;

  acceptingReasons: AcceptingReason[];
  acceptingReasonOther: string;

  changingReasons: ChangingReason[];
  changingReasonOther: string;

  firstJobDuration: JobDuration;
  firstJobDurationOther: string;

  firstJobSource: JobSource;
  firstJobSourceOther: string;

  firstJobSearchDuration: JobDuration;
  firstJobSearchDurationOther: string;

  firstJobTitle: string;

  firstJobLevel: JobLevel;
  currentJobLevel: JobLevel;

  initialMonthlyIncome: MonthlyIncome;

  // Curriculum
  curriculumRelevant: boolean;

  usefulCompetencies: Competency[];
  usefulCompetencyOther: string;
}

export type CivilStatus =
  | "Single"
  | "Married"
  | "Separated/Divorced"
  | "Solo Parent"
  | "Widow or Widower";

export type Sex = "" | "Male" | "Female";

export type AdvanceStudyDegree = "" | "MS" | "MA" | "Others";

export type AdvanceStudyReason =
  | ""
  | "For Promotion"
  | "Professional Development"
  | "Others";

export type EmploymentStatus = "" | "Yes" | "No" | "Never Employed";

export type UnemploymentReason =
  | "Advance Study"
  | "Family Concern"
  | "Health"
  | "Lack of Work Experience"
  | "No Job Opportunity"
  | "Did Not Look For Job"
  | "Others";

export type PresentEmploymentStatus =
  | ""
  | "Regular/Permanent"
  | "Temporary"
  | "Casual"
  | "Contractual"
  | "COS/JO"
  | "Self-employed"
  | "Open Contract";

export type BusinessIndustry =
  | ""
  | "Agriculture"
  | "Fishing"
  | "Mining"
  | "Manufacturing"
  | "Electricity"
  | "Construction"
  | "Wholesale/Retail"
  | "Food and Beverage"
  | "Lodging"
  | "Financial"
  | "Real Estate"
  | "Public Administration"
  | "Education"
  | "Health"
  | "Private Household"
  | "Recreation"
  | "Travel and Tourism"
  | "Meeting and Events";

export type PlaceOfWork = "" | "Local" | "Abroad";

export type StayingReason =
  | "Salary and Benefits"
  | "Career Challenge"
  | "Special Skill"
  | "Related to Course"
  | "Proximity to Residence"
  | "Peer Influence"
  | "Family Influence"
  | "Others";

export type AcceptingReason =
  | "Salary and Benefits"
  | "Career Challenge"
  | "Special Skill"
  | "Proximity to Residence"
  | "Others";

export type ChangingReason =
  | "Salary and Benefits"
  | "Career Challenge"
  | "Special Skill"
  | "Proximity to Residence"
  | "Others";

export type JobDuration =
  | ""
  | "Less than a month"
  | "1-6 months"
  | "7-11 months"
  | "1-2 years"
  | "2-3 years"
  | "3-4 years"
  | "Others";

export type JobSource =
  | ""
  | "Advertisement"
  | "Walk-in"
  | "Recommended"
  | "Friends"
  | "School Placement"
  | "Family Business"
  | "Job Fair/PESO"
  | "Others";

export type JobLevel =
  | ""
  | "Rank/Clerical"
  | "Professional/Technical/Supervisory"
  | "Managerial/Executive"
  | "Self-employed";

export type MonthlyIncome =
  | ""
  | "Below 5000"
  | "5000-9999"
  | "10000-14999"
  | "15000-19999"
  | "20000-24999"
  | "25000 Above";

export type Competency =
  | "Communication Skills"
  | "Human Relation Skills"
  | "Entrepreneurial Skills"
  | "Problem Solving Skills"
  | "Critical Thinking Skills"
  | "Others";
