"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

interface Account {
  id: string;
  name: string;
  email: string;
  role: "admin" | "alumni";
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const isCurrentUser = id === currentUserId;
  console.log(currentUserId);
  useEffect(() => {
    fetchAccount();
  }, [id]);

  async function fetchAccount() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/accounts/${id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setAccount(data.account);
      setName(data.account.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      setSaving(true);

      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setAccount((prev) =>
        prev
          ? {
              ...prev,
              name,
            }
          : prev,
      );

      setEditing(false);

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete this account? This cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

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
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        Loading account...
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
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:bg-sky-100 py-2 pl-3 pr-4 rounded-lg cursor-pointer transition"
      >
        <LuArrowLeft />
        Back
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-2 justify-between">
          <div className="flex-1">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-dashed border-slate-300 bg-sky-50 px-4 py-2 text-2xl font-bold"
              />
            ) : (
              <h1 className="text-3xl font-bold">{account.name}</h1>
            )}

            <p className="mt-2 text-slate-500">{account.email}</p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              account.verified
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {account.verified ? "Verified" : "Pending"}
          </span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Role</p>

            <span
              className={`inline-flex mt-1 rounded-md px-3 py-1 text-sm font-medium ${
                account.role === "admin"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {account.role}
            </span>
          </div>

          <div>
            <p className="text-sm text-slate-500">Created</p>

            <p className="font-medium">
              {new Date(account.createdAt).toLocaleString()}
            </p>
          </div>
          {account.labels && account.labels.length > 0 && (
            <div>
              <p className="text-sm text-slate-500">Labels</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {account.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex gap-3">
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-sky-500 px-5 py-2 text-white hover:bg-sky-600 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => {
                  setEditing(false);
                  setName(account.name);
                }}
                className="rounded-xl border border-slate-300 px-5 py-2 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl bg-sky-500 px-5 py-2 text-white hover:bg-sky-600 cursor-pointer"
            >
              Edit Name
            </button>
          )}
          {!isCurrentUser && (
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="rounded-xl border border-red-300 px-5 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-semibold">Tracer Survey</h2>

        <p className="mt-3 text-slate-500">
          This section will display tracer survey responses.
        </p>
      </div>
    </div>
  );
}
