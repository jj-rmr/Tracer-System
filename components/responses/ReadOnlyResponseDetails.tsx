"use client";

import type { ReactNode } from "react";

import {
  LuBriefcaseBusiness,
  LuExternalLink,
  LuFileText,
  LuGraduationCap,
  LuHistory,
  LuUserRound,
} from "@/components/ui/icons";
import { PROGRAMS } from "@/lib/programs/catalog";
import type { Survey } from "@/types";

interface ReadOnlyResponseDetailsProps {
  response: Survey;
  respondentEmail?: string;
}

type DisplayValue = string | number | boolean | null | undefined | string[];
type Field = [label: string, value: DisplayValue];

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

function resolveOther(value: DisplayValue, otherValue: string) {
  const other = otherValue.trim();

  if (Array.isArray(value)) {
    return value.map((item) => (item === "Others" && other ? other : item));
  }

  return value === "Others" && other ? other : value;
}

function fullName(response: Survey) {
  return [
    response.firstName,
    response.middleName,
    response.lastName,
    response.extensionName,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
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
    <div className="grid min-w-0 gap-1 border-b border-border/70 py-3.5 last:border-b-0 sm:grid-cols-[minmax(9rem,0.8fr)_minmax(0,1.5fr)] sm:gap-6">
      <dt className="text-xs font-medium leading-5 text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          displayValue
            ? "break-words text-sm font-medium leading-5 text-foreground"
            : "text-sm italic leading-5 text-muted-foreground/80"
        }
      >
        {displayValue ?? "Not provided"}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  description,
  icon,
  fields,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  fields: Field[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border bg-muted/35 px-4 py-4 sm:px-5">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <dl className="px-4 sm:px-5">
        {fields.map(([label, value]) => (
          <ResponseField key={label} label={label} value={value} />
        ))}
      </dl>
    </section>
  );
}

export function TracerResponseModalHeader({ response }: { response: Survey }) {
  const programLabel =
    PROGRAMS.find((program) => program.value === response.program)?.label ??
    response.program;
  const respondentName = fullName(response) || "Unnamed respondent";

  return (
    <div className="pr-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
        Tracer response
      </p>
      <h3 className="mt-0.5 break-words text-lg font-semibold tracking-tight text-primary-foreground sm:text-xl">
        {respondentName}
      </h3>
      <p className="mt-0.5 text-xs text-primary-foreground/80 sm:text-sm">
        {normalizeValue(programLabel) ?? "Program not provided"}
        {normalizeValue(response.yearGraduated)
          ? ` · Class of ${response.yearGraduated}`
          : ""}
      </p>
      <dl className="mt-3 grid gap-3 border-t border-primary-foreground/20 pt-3 sm:grid-cols-3 sm:gap-6">
        <div>
          <dt className="text-xs text-primary-foreground/65">Employment</dt>
          <dd className="text-xs font-semibold text-primary-foreground sm:text-sm">
            {normalizeValue(response.employmentStatus) ?? "Not provided"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-primary-foreground/65">Current role</dt>
          <dd className="text-xs font-semibold text-primary-foreground sm:text-sm">
            {normalizeValue(response.currentOccupation) ?? "Not provided"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-primary-foreground/65">Employer</dt>
          <dd className="text-xs font-semibold text-primary-foreground sm:text-sm">
            {normalizeValue(response.companyName) ?? "Not provided"}
          </dd>
        </div>
      </dl>
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

  const sections = [
    {
      title: "Contact & personal details",
      description: "Identity, contact information, and current address.",
      icon: <LuUserRound size={18} aria-hidden="true" />,
      fields: [
        ["Email address", respondentEmail],
        ["Contact numbers", response.contactNumbers],
        ["Sex", response.sex],
        ["Civil status", response.civilStatus],
        [
          "Address",
          [
            response.street,
            response.barangay,
            response.municipality,
            response.province,
            response.region,
          ]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(", "),
        ],
      ],
    },
    {
      title: "Education & further studies",
      description: "Degree completed, achievements, and continuing education.",
      icon: <LuGraduationCap size={18} aria-hidden="true" />,
      fields: [
        ["Degree program", programLabel],
        ["Graduation year", response.yearGraduated],
        ["Honors and awards", response.honors],
        ["Trainings and certifications", response.trainings],
        [
          "Advanced-study degree",
          resolveOther(
            response.advancedStudyDegree,
            response.advancedStudyOther,
          ),
        ],
        [
          "Reason for advanced study",
          resolveOther(
            response.advancedStudyReasons,
            response.advancedStudyReasonOther,
          ),
        ],
      ],
    },
    {
      title: "Current employment",
      description: "Present work status, employer, role, and workplace.",
      icon: <LuBriefcaseBusiness size={18} aria-hidden="true" />,
      fields: [
        ["Currently employed", response.employmentStatus],
        [
          "Reasons for unemployment",
          resolveOther(
            response.unemploymentReasons,
            response.unemploymentReasonOther,
          ),
        ],
        ["Employment status", response.currentEmploymentStatus],
        ["Occupation", response.currentOccupation],
        ["Company", response.companyName],
        ["Company address", response.companyAddress],
        ["Business or industry", response.businessIndustry],
        ["Place of work", response.placeOfWork],
      ],
    },
    {
      title: "First job & career history",
      description:
        "How the respondent entered work and progressed in their career.",
      icon: <LuHistory size={18} aria-hidden="true" />,
      fields: [
        ["Current job is first job", response.isFirstJob],
        ["First job related to program", response.isFirstJobRelated],
        [
          "Reasons for staying",
          resolveOther(response.stayingReasons, response.stayingReasonOther),
        ],
        [
          "Reasons for accepting first job",
          resolveOther(
            response.acceptingReasons,
            response.acceptingReasonOther,
          ),
        ],
        [
          "Reasons for changing job",
          resolveOther(response.changingReasons, response.changingReasonOther),
        ],
        [
          "Time before first job",
          resolveOther(
            response.firstJobDuration,
            response.firstJobDurationOther,
          ),
        ],
        [
          "How first job was found",
          resolveOther(response.firstJobSource, response.firstJobSourceOther),
        ],
        [
          "First-job search duration",
          resolveOther(
            response.firstJobSearchDuration,
            response.firstJobSearchDurationOther,
          ),
        ],
        ["First job title", response.firstJobTitle],
        ["First-job level", response.firstJobLevel],
        ["Current-job level", response.currentJobLevel],
        ["Initial monthly income", response.initialMonthlyIncome],
      ],
    },
    {
      title: "Curriculum relevance",
      description: "Connection between the degree program and employment.",
      icon: <LuFileText size={18} aria-hidden="true" />,
      fields: [
        ["Curriculum relevant to first job", response.curriculumRelevant],
        [
          "Useful competencies",
          resolveOther(
            response.usefulCompetencies,
            response.usefulCompetencyOther,
          ),
        ],
      ],
    },
  ] satisfies Array<{
    title: string;
    description: string;
    icon: ReactNode;
    fields: Field[];
  }>;

  return (
    <div className="space-y-5 pb-1">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {sections.map((section) => (
          <DetailSection key={section.title} {...section} />
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-muted/35 px-4 py-4 sm:px-5">
          <h3 className="text-sm font-semibold text-foreground">
            Supporting documents
          </h3>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Files submitted with this tracer response.
          </p>
        </div>
        {response.documents.length === 0 ? (
          <p className="px-5 py-5 text-sm italic text-muted-foreground">
            No supporting documents provided.
          </p>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {response.documents.map((document) => (
              <a
                key={document.id}
                href={`/api/admin/files/${encodeURIComponent(document.googleDriveFileId)}/content`}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3.5 text-foreground transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <LuFileText className="shrink-0 text-primary" size={19} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {document.filename}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {document.documentType ?? "Supporting document"}
                  </span>
                </span>
                <LuExternalLink className="shrink-0" size={15} />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
