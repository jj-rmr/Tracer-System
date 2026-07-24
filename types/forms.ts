export type FormFieldType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "boolean"
  | "string-list"
  | "file";

export interface FormOption {
  value: string;
  label: string;
}

export interface FormSectionDefinition {
  id: string;
  title: string;
  fieldKeys: string[];
}

export interface FormDefinition {
  slug: string;
  version: number;
  title: string;
  description: string;
  sections: FormSectionDefinition[];
  optionSets: Record<string, FormOption[]>;
}

export type StudyPeriodStatus =
  | "upcoming"
  | "open"
  | "closed"
  | "archived";

export type FormResponseStatus = "draft" | "submitted";
export type FormResponseSource = "alumni" | "admin_import";
export type ManualImportStatus = "processing" | "completed" | "failed";
export type ResponseDeletionStatus = "active" | "deleting" | "delete_failed";

export interface StudyPeriod {
  id: string;
  formId: string;
  formVersionId: string;
  academicYear: string;
  title: string;
  opensAt: string;
  closesAt: string;
  archivedAt: string | null;
  status: StudyPeriodStatus;
}

export interface StudyContext {
  study: StudyPeriod;
  definition: FormDefinition;
}

export interface PublishedFormVersion {
  id: string;
  formId: string;
  slug: string;
  title: string;
  version: number;
}

export interface StudyPeriodSummary extends StudyPeriod {
  responseCount: number;
  submittedResponseCount: number;
}

export interface FormResponse {
  id: string;
  studyPeriodId: string;
  userId: string | null;
  source: FormResponseSource;
  respondentName: string | null;
  respondentEmail: string | null;
  enteredByUserId: string | null;
  status: FormResponseStatus;
  answers: Record<string, unknown>;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletionStatus: ResponseDeletionStatus;
}

export interface AdminResponseSummary {
  id: string;
  studyPeriodId: string;
  academicYear: string;
  studyTitle: string;
  source: FormResponseSource;
  status: FormResponseStatus;
  respondentName: string | null;
  respondentEmail: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: string;
  civilStatus: string;
  employmentStatus: string;
  program: string;
  submittedAt: string | null;
  createdAt: string;
  importStatus: ManualImportStatus;
  deletionStatus: ResponseDeletionStatus;
}

export interface AdminResponseFilters {
  search?: string;
  studyPeriodId?: string;
  program?: string;
  source?: FormResponseSource;
  status?: FormResponseStatus;
  employmentStatus?: string;
}
