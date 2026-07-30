import { IconLink as Link } from "@/components/ui/icon-link";
import {
  LuChevronRight,
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuCircleCheck,
  LuClock3,
  LuFilePenLine,
  LuGraduationCap,
  LuHistory,
  LuShieldCheck,
} from "@/components/ui/icons";
import type { SystemIconProps } from "@/components/ui/icons";
import type { ComponentType } from "react";

import { buttonVariants } from "@/components/ui/button";
import { requireUserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { listFormResponsesByUser } from "@/lib/repositories/form-responses.repository";
import { getOpenStudyByFormSlug } from "@/lib/repositories/forms.repository";
import { ROLES } from "@/types";

type DashboardItem = {
  label: string;
  value: number | string;
  icon: ComponentType<SystemIconProps>;
};

type ChecklistItem = {
  title: string;
  description: string;
  icon: ComponentType<SystemIconProps>;
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Graduate";
}

export default async function AlumniPage() {
  const user = await requireUserRole([ROLES.ALUMNI]);
  const [openContext, responses] = await Promise.all([
    getOpenStudyByFormSlug("graduate-tracer"),
    listFormResponsesByUser(user.$id),
  ]);

  const activeResponse = openContext
    ? (responses.find(
        (response) => response.studyPeriodId === openContext.study.id,
      ) ?? null)
    : null;
  const submittedCount = responses.filter(
    (response) => response.status === "submitted",
  ).length;
  const actionLabel = activeResponse
    ? activeResponse.status === "submitted"
      ? "Review your response"
      : "Continue your response"
    : "Start your response";
  const dashboardItems: DashboardItem[] = [
    { label: "Responses", value: responses.length, icon: LuHistory },
    { label: "Submitted", value: submittedCount, icon: LuCircleCheck },
    {
      label: "Current status",
      value:
        activeResponse?.status ?? (openContext ? "Not started" : "Unavailable"),
      icon: activeResponse?.status === "draft" ? LuClock3 : LuFilePenLine,
    },
  ];
  const checklistItems: ChecklistItem[] = [
    {
      title: "Confirm your details",
      description: "Review your contact and education information.",
      icon: LuGraduationCap,
    },
    {
      title: "Share your journey",
      description: "Tell us about employment or further study.",
      icon: LuBriefcaseBusiness,
    },
    {
      title: "Keep it current",
      description: "Return when your circumstances change.",
      icon: LuCalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/10" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <LuGraduationCap aria-hidden="true" />
              Alumni dashboard
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {firstName(user.name)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Keep your graduate information current and help the university
              understand where life after graduation has taken you.
            </p>
          </div>
          <span className="grid size-24 place-items-center rounded-3xl bg-primary/10 text-primary sm:size-28">
            <LuBriefcaseBusiness aria-hidden="true" size={45} />
          </span>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid lg:grid-cols-[1fr_auto] lg:items-stretch">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  openContext
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {openContext ? "Study open" : "No active study"}
              </span>
              {activeResponse && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activeResponse.status === "submitted"
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {activeResponse.status === "submitted"
                    ? "Response submitted"
                    : "Draft saved"}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              {openContext?.study.title ??
                "Your tracer response is currently up to date"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {openContext
                ? `${openContext.study.academicYear} · ${openContext.definition.description}`
                : responses.length > 0
                  ? "There is no open tracer study right now. You can still review your most recent response."
                  : "There is no tracer study accepting responses right now. Check back when a new study opens."}
            </p>

            {(openContext || responses.length > 0) && (
              <Link
                href="/alumni/responses"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover"
              >
                {openContext ? actionLabel : "View your latest response"}
                <LuChevronRight aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="grid border-t border-border bg-muted/50 p-6 sm:grid-cols-3 lg:w-72 lg:grid-cols-1 lg:border-l lg:border-t-0">
            {dashboardItems.map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`py-4 first:pt-0 last:pb-0 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0 lg:px-0 lg:py-4 lg:first:pt-0 lg:last:pb-0 ${
                  index > 0
                    ? "border-t border-border sm:border-l sm:border-t-0 lg:border-l-0 lg:border-t"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Icon aria-hidden="true" size={15} />
                  {label}
                </div>
                <p className="mt-2 text-lg font-semibold capitalize text-foreground">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Your tracer checklist
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A useful response is accurate, complete, and current.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {checklistItems.map(({ title, description, icon: Icon }, index) => (
              <div key={title} className="rounded-2xl bg-muted p-4">
                <span className="grid size-9 place-items-center rounded-xl bg-card text-primary shadow-sm">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {index + 1}. {title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <span className="grid size-11 place-items-center rounded-2xl bg-success/15 text-success">
            <LuShieldCheck aria-hidden="true" size={21} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-foreground">
            Why your response matters
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Graduate outcomes help ParSU evaluate programs, improve career
            support, plan services, and understand the paths alumni take after
            graduation.
          </p>
          <Link
            href="/alumni/settings"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mt-5 text-primary hover:bg-primary/10 hover:text-primary",
            )}
          >
            Review account information
            <LuChevronRight aria-hidden="true" />
          </Link>
        </section>
      </div>

      {responses.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5 sm:px-6">
            <h2 className="text-lg font-semibold text-foreground">
              Response history
            </h2>
            <p className="text-sm text-muted-foreground">
              Your most recent tracer activity
            </p>
          </div>
          <div className="divide-y divide-border">
            {responses.slice(0, 3).map((response) => (
              <div
                key={response.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
                    response.status === "submitted"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {response.status === "submitted" ? (
                    <LuCircleCheck aria-hidden="true" />
                  ) : (
                    <LuClock3 aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold capitalize text-foreground">
                    {response.status} response
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Updated{" "}
                    {new Date(response.updatedAt).toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {response.source === "admin_import"
                    ? "Entered by administrator"
                    : "Alumni response"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
