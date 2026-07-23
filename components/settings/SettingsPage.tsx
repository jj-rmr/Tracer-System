import { LuCircleHelp, LuInfo, LuUserRound } from "react-icons/lu";

import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  InfoAccordion,
  type InfoAccordionItem,
} from "@/components/settings/InfoAccordion";
import { type Role, ROLES } from "@/types";

interface SettingsPageProps {
  name: string;
  email: string;
  role: Role;
}

const alumniInformation: InfoAccordionItem[] = [
  {
    id: "access",
    title: "Signing in to the Tracer System",
    content:
      "Use your official @parsu.edu.ph Google account. The system does not maintain a separate password for your Tracer System access.",
  },
  {
    id: "survey",
    title: "Keeping your tracer survey current",
    content:
      "Return to the Survey page whenever your contact, education, or employment information changes so the university has an up-to-date alumni record.",
  },
  {
    id: "data-use",
    title: "How submitted information is used",
    content:
      "Tracer survey information supports alumni tracking, institutional planning, program evaluation, and authorized university reporting.",
  },
];

const adminInformation: InfoAccordionItem[] = [
  {
    id: "access",
    title: "Administrator access",
    content:
      "Administrator access is tied to your official @parsu.edu.ph Google account and the admin role assigned to your Appwrite user record.",
  },
  {
    id: "accounts",
    title: "Managing alumni accounts",
    content:
      "Use the Accounts area to review user records and roles. New eligible Google sign-ins are registered as alumni by default.",
  },
  {
    id: "reporting",
    title: "Survey review and exports",
    content:
      "Use survey and account exports only for authorized university operations, institutional reporting, and alumni tracer activities.",
  },
];

export default function SettingsPage({ name, email, role }: SettingsPageProps) {
  const informationItems =
    role === ROLES.ADMIN ? adminInformation : alumniInformation;

  return (
    <div className="w-full space-y-6 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500">
          Review your access details and Tracer System information.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
            <LuUserRound size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              Account Profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your profile is managed through your official Google account.
            </p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-slate-800">
                  {email}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <LuInfo className="text-sky-600" size={22} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              System information
            </h2>
            <p className="text-sm text-slate-500">
              Guidance relevant to your {role} access.
            </p>
          </div>
        </div>
        <InfoAccordion items={informationItems} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-4">
          <LuCircleHelp className="mt-0.5 shrink-0 text-sky-600" size={22} />
          <div>
            <h2 className="font-semibold text-slate-900">Help and support</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              For access problems, incorrect account information, or technical
              issues, contact the ParSU Placement Office or your designated
              Tracer System administrator.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
