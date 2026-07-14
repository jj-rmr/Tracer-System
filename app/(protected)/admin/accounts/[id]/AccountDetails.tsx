"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { Role, Survey } from "@/types";

interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  labels: string[];
  createdAt: string;
}

interface Props {
  id: string;
  currentUserId: string;
}

export default function AccountDetails({ id, currentUserId }: Props) {
  const router = useRouter();

  const [account, setAccount] = useState<Account | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isCurrentUser = id === currentUserId;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/accounts/${id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setAccount(data.account);
        setSurvey(data.survey);
        setName(data.account.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function save() {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAccount((prev) => (prev ? { ...prev, name } : prev));
      setEditing(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete this account? This cannot be undone.")) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.replace("/admin/accounts");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Loading account profile and survey...
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? "Account not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:bg-sky-50 py-2 pl-3 pr-4 rounded-xl cursor-pointer transition"
      >
        <LuArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Account Info Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4 justify-between flex-wrap">
          <div className="flex-1 min-w-[250px]">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-dashed border-slate-300 bg-sky-50 px-4 py-2 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <h1 className="text-3xl font-bold text-slate-900">
                {account.name}
              </h1>
            )}
            <p className="mt-2 text-slate-500">{account.email}</p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              account.verified
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {account.verified ? "Verified" : "Pending"}
          </span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 border-t border-slate-100 pt-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Role
            </p>
            <span
              className={`inline-flex mt-1 rounded-md px-2.5 py-0.5 text-sm font-medium ${
                account.role === "Admin"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {account.role}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Created
            </p>
            <p className="font-medium text-slate-800 mt-1">
              {new Date(account.createdAt).toLocaleString()}
            </p>
          </div>

          {account.labels && account.labels.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Labels
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {account.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 cursor-pointer transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(account.name);
                }}
                className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 cursor-pointer transition"
            >
              Edit Name
            </button>
          )}
          {!isCurrentUser && (
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="rounded-xl border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer transition ml-auto"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          )}
        </div>
      </div>

      {/* Tracer Survey Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Tracer Survey Response
        </h2>

        {loadingSurvey ? (
          <p className="text-slate-500">Loading survey responses...</p>
        ) : !survey ? (
          <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
            <p className="text-slate-500">
              No tracer survey data submitted by this user yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8 divide-y divide-slate-100">
            {/* 1. Personal Information */}
            <div className="pt-2">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                Personal Profile
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Full Name
                  </label>
                  <p className="font-medium text-slate-800">
                    {[
                      survey.firstName,
                      survey.middleName,
                      survey.lastName,
                      survey.extensionName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Sex / Civil Status
                  </label>
                  <p className="font-medium text-slate-800">
                    {survey.sex || "—"} / {survey.civilStatus}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Year Graduated
                  </label>
                  <p className="font-medium text-slate-800">
                    {survey.yearGraduated || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Contact Info
                  </label>
                  <p className="font-medium text-slate-800">
                    {survey.contactNumbers?.length > 0
                      ? survey.contactNumbers.join(", ")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-400 block">
                  Address
                </label>
                <p className="font-medium text-slate-800">
                  {[
                    survey.street,
                    survey.barangay,
                    survey.municipality,
                    survey.province,
                    survey.region,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
            </div>

            {/* 2. Education & Qualifications */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                Academic Details & Achievements
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Honors Received
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {survey.honors?.length > 0 ? (
                      survey.honors.map((h, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded border border-amber-100"
                        >
                          {h}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        None declared
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Advanced Graduate Studies
                  </label>
                  {survey.advanceStudyDegree ? (
                    <div className="text-sm">
                      <p className="font-semibold text-slate-800">
                        {survey.advanceStudyDegree}{" "}
                        {survey.advanceStudyOther &&
                          `(${survey.advanceStudyOther})`}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Reason:{" "}
                        {survey.advanceStudyReasons ||
                          survey.advanceStudyReasonOther}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">
                      No advanced studies pursued
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Trainings/Seminars Attended
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {survey.trainings?.length > 0 ? (
                    survey.trainings.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">None logged</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Employment Overview */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                Current Employment Status
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Employment Status
                  </label>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold ${survey.employmentStatus?.toLowerCase() === "employed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-700"}`}
                  >
                    {survey.employmentStatus || "—"}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Current Position / Role
                  </label>
                  <p className="font-semibold text-slate-800 mt-1">
                    {survey.presentOccupation || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Job Position Level
                  </label>
                  <p className="font-medium text-slate-800 mt-1">
                    {survey.currentJobLevel || "—"}
                  </p>
                </div>
              </div>

              {survey.employmentStatus?.toLowerCase() === "employed" ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block">
                      Company Name
                    </label>
                    <p className="font-medium text-slate-800">
                      {survey.companyName || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block">
                      Industry Sector / Work Location
                    </label>
                    <p className="font-medium text-slate-800">
                      {survey.businessIndustry || "—"} (
                      {survey.placeOfWork || "—"})
                    </p>
                  </div>
                </div>
              ) : (
                survey.unemploymentReasons?.length > 0 && (
                  <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-100 text-sm">
                    <p className="font-medium text-red-800 mb-1">
                      Unemployment Reason:
                    </p>
                    <p className="text-red-700">
                      {survey.unemploymentReasons.join(", ")}{" "}
                      {survey.unemploymentReasonOther &&
                        `(${survey.unemploymentReasonOther})`}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* 4. First Job Placement Insights */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                First Job Details After Graduation
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Is This First Job?
                  </label>
                  <p className="font-medium text-slate-800">
                    {survey.isFirstJob ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Course Relevance
                  </label>
                  <p className="font-medium text-slate-800">
                    {survey.isFirstJobRelated
                      ? "Directly Related"
                      : "Not Related"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Initial Pay Range
                  </label>
                  <p className="font-medium text-slate-800">
                    ₱{survey.initialMonthlyIncome || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Search Duration
                  </label>
                  <p className="font-medium text-slate-800">
                    {survey.firstJobSearchDuration ||
                      survey.firstJobSearchDurationOther ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-4 text-sm">
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    First Job Sourcing
                  </label>
                  <p className="text-slate-700">
                    {survey.firstJobSource || survey.firstJobSourceOther || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block">
                    Tenure/Duration
                  </label>
                  <p className="text-slate-700">
                    {survey.firstJobDuration ||
                      survey.firstJobDurationOther ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Qualitative Feedback & Competencies */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-sky-700 mb-4">
                Curriculum Evaluation & Feedback
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-slate-500">
                    Do you find the institution's curriculum relevant to your
                    employment?
                  </span>
                  <span
                    className={`ml-2 font-bold ${survey.curriculumRelevant ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {survey.curriculumRelevant
                      ? "Yes, Highly Relevant"
                      : "No, Inadequate"}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Most Useful Skills/Competencies Acquired:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {survey.usefulCompetencies?.length > 0 ? (
                      survey.usefulCompetencies.map((comp, idx) => (
                        <span
                          key={idx}
                          className="bg-sky-50 text-sky-800 text-xs px-2.5 py-1 rounded-full border border-sky-100 font-medium"
                        >
                          {comp}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">
                        None selected
                      </span>
                    )}
                    {survey.usefulCompetencyOther && (
                      <span className="bg-purple-50 text-purple-800 text-xs px-2.5 py-1 rounded-full border border-purple-100 font-medium">
                        {survey.usefulCompetencyOther}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
