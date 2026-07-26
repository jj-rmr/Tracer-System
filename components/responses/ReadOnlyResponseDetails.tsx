"use client";

import { LuExternalLink, LuFileText } from "react-icons/lu";

import { PROGRAMS } from "@/lib/programs/catalog";
import type { Survey } from "@/types";

interface ReadOnlyResponseDetailsProps {
  response: Survey;
  respondentEmail?: string;
}

type DisplayValue = string | number | boolean | null | undefined | string[];

function normalizeValue(value: DisplayValue) {
  if (Array.isArray(value)) {
    const entries = value.map((item) => item.trim()).filter(Boolean);
    return entries.length > 0 ? entries.join(", ") : null;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value > 0 ? String(value) : null;
  if (typeof value === "string") return value.trim() || null;
  return null;
}

function ResponseField({
  label,
  value,
}: {
  label: string;
  value: DisplayValue;
}) {
  const displayValue = normalizeValue(value);

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          displayValue
            ? "mt-1.5 break-words text-sm font-medium leading-6 text-foreground"
            : "mt-1.5 text-sm italic leading-6 text-muted-foreground"
        }
      >
        {displayValue ?? "Not provided"}
      </dd>
    </div>
  );
}

export default function ReadOnlyResponseDetails({
  response,
  respondentEmail,
}: ReadOnlyResponseDetailsProps) {
  const programLabel =
    PROGRAMS.find((program) => program.value === response.program)?.label ??
    response.program;
  const groups = [
    {
      title: "Personal information",
      fields: [
        ["First name", response.firstName],
        ["Middle name", response.middleName],
        ["Last name", response.lastName],
        ["Extension name", response.extensionName],
        ["Sex", response.sex],
        ["Civil status", response.civilStatus],
        ["Contact numbers", response.contactNumbers],
        ["Respondent email", respondentEmail],
        ["Street", response.street],
        ["Barangay", response.barangay],
        ["Municipality", response.municipality],
        ["Province", response.province],
        ["Region", response.region],
      ],
    },
    {
      title: "Education and further studies",
      fields: [
        ["Program", programLabel],
        ["Year graduated", response.yearGraduated],
        ["Honors and awards", response.honors],
        ["Trainings and certifications", response.trainings],
        ["Advanced-study degree", response.advancedStudyDegree],
        ["Other advanced-study degree", response.advancedStudyOther],
        ["Reason for advanced study", response.advancedStudyReasons],
        ["Other advanced-study reason", response.advancedStudyReasonOther],
      ],
    },
    {
      title: "Current employment",
      fields: [
        ["Currently employed", response.employmentStatus],
        ["Reasons for unemployment", response.unemploymentReasons],
        ["Other unemployment reason", response.unemploymentReasonOther],
        ["Employment status", response.currentEmploymentStatus],
        ["Occupation", response.currentOccupation],
        ["Company name", response.companyName],
        ["Company address", response.companyAddress],
        ["Business or industry", response.businessIndustry],
        ["Place of work", response.placeOfWork],
      ],
    },
    {
      title: "First job and career history",
      fields: [
        ["Current job is first job", response.isFirstJob],
        ["First job related to program", response.isFirstJobRelated],
        ["Reasons for staying", response.stayingReasons],
        ["Other reason for staying", response.stayingReasonOther],
        ["Reasons for accepting first job", response.acceptingReasons],
        ["Other reason for accepting", response.acceptingReasonOther],
        ["Reasons for changing job", response.changingReasons],
        ["Other reason for changing", response.changingReasonOther],
        ["Time before first job", response.firstJobDuration],
        ["Other first-job duration", response.firstJobDurationOther],
        ["How first job was found", response.firstJobSource],
        ["Other first-job source", response.firstJobSourceOther],
        ["First-job search duration", response.firstJobSearchDuration],
        ["Other search duration", response.firstJobSearchDurationOther],
        ["First job title", response.firstJobTitle],
        ["First-job level", response.firstJobLevel],
        ["Current-job level", response.currentJobLevel],
        ["Initial monthly income", response.initialMonthlyIncome],
      ],
    },
    {
      title: "Curriculum relevance",
      fields: [
        ["Curriculum relevant to first job", response.curriculumRelevant],
        ["Useful competencies", response.usefulCompetencies],
        ["Other useful competency", response.usefulCompetencyOther],
      ],
    },
  ] satisfies Array<{
    title: string;
    fields: Array<[string, DisplayValue]>;
  }>;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-muted/70">
      <div className="border-b border-border bg-card px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-foreground">
          Complete response
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Blank answers are marked as “Not provided.”
        </p>
      </div>

      <div className="space-y-8 p-5 sm:p-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {group.title}
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.fields.map(([label, value]) => (
                <ResponseField key={label} label={label} value={value} />
              ))}
            </dl>
          </div>
        ))}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Supporting documents
          </h3>
          {response.documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-input bg-card px-4 py-5 text-sm italic text-muted-foreground">
              Not provided
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {response.documents.map((document) => (
                <a
                  key={document.id}
                  href={`/api/admin/files/${encodeURIComponent(document.googleDriveFileId)}/content`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm transition duration-200 hover:border-input hover:text-muted-foreground"
                >
                  <LuFileText className="shrink-0" size={20} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {document.filename}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {document.documentType ?? "Supporting document"}
                    </span>
                  </span>
                  <LuExternalLink className="shrink-0" size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
