import { IconLink as Link } from "@/components/ui/icon-link";
import {
  LuChevronRight,
  LuCalendarClock,
  LuChartNoAxesCombined,
  LuCircleCheck,
  LuClock3,
  LuFileSpreadsheet,
  LuFolderOpen,
  LuPlus,
  LuUsersRound,
} from "@/components/ui/icons";

import RecentResponses from "@/components/admin/dashboard/RecentResponses";
import { requireAdmin } from "@/lib/auth";
import { listAdminResponseSummaries } from "@/lib/repositories/admin-responses.repository";
import { listStudyPeriodSummaries } from "@/lib/repositories/study-admin.repository";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Administrator";
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const [studies, recentResult] = await Promise.all([
    listStudyPeriodSummaries(),
    listAdminResponseSummaries({ filters: {}, page: 1, limit: 5 }),
  ]);

  const openStudy = studies.find((study) => study.status === "open") ?? null;
  const totalResponses = studies.reduce(
    (total, study) => total + study.responseCount,
    0,
  );
  const submittedResponses = studies.reduce(
    (total, study) => total + study.submittedResponseCount,
    0,
  );
  const draftResponses = Math.max(0, totalResponses - submittedResponses);
  const submissionRate = openStudy?.responseCount
    ? Math.round(
        (openStudy.submittedResponseCount / openStudy.responseCount) * 100,
      )
    : 0;

  const metrics = [
    {
      label: "All responses",
      value: totalResponses,
      detail: "Across every study",
      icon: LuFileSpreadsheet,
    },
    {
      label: "Submitted",
      value: submittedResponses,
      detail: "Completed responses",
      icon: LuCircleCheck,
    },
    {
      label: "Drafts",
      value: draftResponses,
      detail: "Awaiting completion",
      icon: LuClock3,
    },
    {
      label: "Study periods",
      value: studies.length,
      detail: `${studies.filter((study) => study.status === "open").length} currently open`,
      icon: LuCalendarClock,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <LuChartNoAxesCombined aria-hidden="true" />
              Administration overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {firstName(user.name)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Monitor graduate tracer activity and continue the work that needs
              your attention.
            </p>
          </div>
          <Link
            href="/admin/responses"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover"
          >
            View responses
            <LuChevronRight aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section
        aria-label="Tracer study metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" size={20} />
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {metric.detail}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Active study
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                {openStudy?.title ?? "No study is currently open"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {openStudy
                  ? `${openStudy.academicYear} academic year`
                  : "Open a study period when you are ready to receive responses."}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                openStudy
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {openStudy ? "Open" : "Inactive"}
            </span>
          </div>

          {openStudy ? (
            <div className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-foreground">
                    {openStudy.submittedResponseCount.toLocaleString()}
                    <span className="text-base font-medium text-muted-foreground">
                      {" "}
                      / {openStudy.responseCount.toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted out of recorded responses
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {submissionRate}% submitted
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/studies"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
                >
                  Manage study
                </Link>
                <Link
                  href={`/admin/responses?study=${encodeURIComponent(openStudy.id)}`}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary/10"
                >
                  View study responses
                  <LuChevronRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/admin/studies"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <LuPlus aria-hidden="true" />
              Manage studies
            </Link>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Common administration tools
          </p>
          <div className="mt-5 grid gap-2">
            {[
              ["Review responses", "/admin/responses", LuFileSpreadsheet],
              ["Manage studies", "/admin/studies", LuCalendarClock],
              ["Manage accounts", "/admin/accounts", LuUsersRound],
              ["Browse files", "/admin/files", LuFolderOpen],
            ].map(([label, href, Icon]) => (
              <Link
                key={href as string}
                href={href as string}
                className="group flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-muted-foreground transition-colors duration-200 group-hover:text-primary">
                  <Icon aria-hidden="true" size={18} />
                </span>
                {label as string}
                <LuChevronRight
                  aria-hidden="true"
                  className="ml-auto text-muted-foreground"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <RecentResponses responses={recentResult.responses} />
    </div>
  );
}
