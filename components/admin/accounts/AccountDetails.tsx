"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { Role, Survey } from "@/types";
import ResponseWorkspace from "@/components/responses/ResponseWorkspace";
import { defaultSurvey } from "@/lib/surveys/defaults";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-500">
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
          <div className="flex-1 min-w-62.5">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {account.name}
            </h1>
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
                account.role === "admin"
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
        <div className="mt-8 gap-3 border-t border-slate-100 pt-6">
          {!isCurrentUser && (
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          )}
        </div>
        <ConfirmationDialog
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => void deleteAccount()}
          title="Delete account?"
          description="This account will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete Account"
          busy={deleting}
          tone="danger"
        />
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
        <ResponseWorkspace
            survey={{
              ...defaultSurvey,
              ...(survey ?? {}),
            }}
            isNew={!survey}
            updatedAt={survey?.updatedAt}
            responseId={survey?.id}
            readOnly={true}
          />
        )}
      </div>
    </div>
  );
}
