"use client";

import { Button } from "@/components/ui/button";
import { TableActionMenu } from "@/components/ui/table-action-menu";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuEye, LuShieldCheck, LuTrash2 } from "@/components/ui/icons";
import { Role } from "@/types";
import { useToast } from "@/components/ui/Toast";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { friendlyRequestMessage } from "@/lib/api/client-errors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

interface Account {
  id: string;
  name: string;
  email: string;
  pictureUrl: string | null;
  role: Role;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServerDataResponse {
  accounts: Account[];
  success: boolean;
}

interface AccountsTableProps {
  currentPage: number;
  searchQuery: string;
  onPageChange: (page: number) => void;
  currentUserId: string;
  roleFilter: Role | "";
}

export default function AccountsTable({
  currentPage,
  searchQuery,
  onPageChange,
  currentUserId,
  roleFilter,
}: AccountsTableProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [accountToView, setAccountToView] = useState<Account | null>(null);
  const [roleChange, setRoleChange] = useState<{
    account: Account;
    role: Role;
  } | null>(null);
  const [roleConfirmation, setRoleConfirmation] = useState("");
  const [changingRole, setChangingRole] = useState(false);

  const router = useRouter();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;

    async function fetchAccounts() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/accounts", {
          cache: "no-store",
          credentials: "include",
        });

        const data: ServerDataResponse = await res.json();

        if (!res.ok) {
          throw new Error("Failed to load accounts.");
        }

        let filtered = data.accounts ?? [];

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();

          filtered = filtered.filter(
            (account) =>
              account.name.toLowerCase().includes(query) ||
              account.email.toLowerCase().includes(query),
          );
        }

        if (roleFilter) {
          filtered = filtered.filter((account) => account.role === roleFilter);
        }

        if (cancelled) return;

        setTotalRows(filtered.length);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        setAccounts(filtered.slice(start, end));
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            friendlyRequestMessage(
              err,
              "An error occurred on our end and we couldn’t retrieve the accounts.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAccounts();

    return () => {
      cancelled = true;
    };
  }, [currentPage, reloadKey, roleFilter, searchQuery]);

  const requiredRoleConfirmation =
    roleChange?.role === "admin" ? "PROMOTE TO ADMIN" : "DEMOTE TO ALUMNI";

  const closeRoleChange = () => {
    if (changingRole) return;
    setRoleChange(null);
    setRoleConfirmation("");
  };

  const confirmRoleChange = async () => {
    if (!roleChange || roleConfirmation !== requiredRoleConfirmation) return;
    setChangingRole(true);

    try {
      const res = await fetch(`/api/admin/accounts/${roleChange.account.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: roleChange.role === "admin" ? "promote" : "demote",
          confirmation: roleConfirmation,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message ?? "Failed to change account role.");

      if (roleFilter && roleFilter !== roleChange.role) {
        setAccounts((current) =>
          current.filter((account) => account.id !== roleChange.account.id),
        );
        setTotalRows((current) => Math.max(0, current - 1));
      } else {
        setAccounts((current) =>
          current.map((account) =>
            account.id === roleChange.account.id
              ? { ...account, role: roleChange.role }
              : account,
          ),
        );
      }
      showToast({ message: data.message, type: "success" });
      setRoleChange(null);
      setRoleConfirmation("");
      router.refresh();
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to change account role.",
        type: "error",
      });
    } finally {
      setChangingRole(false);
    }
  };

  const confirmDelete = async () => {
    if (!accountToDelete || deleteConfirmation !== "DELETE ACCOUNT") return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/accounts/${accountToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to delete account.");
      }

      setAccounts((prev) =>
        prev.filter((account) => account.id !== accountToDelete.id),
      );
      setTotalRows((prev) => Math.max(0, prev - 1));
      setAccountToDelete(null);
      setDeleteConfirmation("");

      showToast({
        message: "Account deleted successfully.",
        type: "success",
      });

      router.refresh();
    } catch (err: unknown) {
      showToast({
        message:
          err instanceof Error ? err.message : "Failed to delete account.",
        type: "error",
      });

      setAccountToDelete(null);
      setDeleteConfirmation("");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState className="min-h-72" message="Loading accounts..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        retryLabel="Refresh accounts"
        onRetry={() => setReloadKey((current) => current + 1)}
      />
    );
  }

  if (totalRows === 0) {
    return (
      <div className="text-center w-full p-12 text-muted-foreground bg-muted rounded-2xl border border-dashed border-border">
        No accounts found.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border bg-card text-sm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Full Name</TableHead>

            <TableHead>Email</TableHead>
            <TableHead className="text-center">Role</TableHead>

            <TableHead className="text-center">Verified</TableHead>

            <TableHead>Created</TableHead>

            <TableHead>Updated</TableHead>

            <TableHead className="text-center">Menu</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-semibold whitespace-nowrap text-foreground">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    name={account.name}
                    pictureUrl={account.pictureUrl}
                    size={36}
                  />
                  {account.name || (
                    <span className="italic text-muted-foreground">
                      Unnamed User
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {account.email}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                      account.role === "admin"
                        ? "bg-secondary text-secondary-foreground border border-border"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {account.role}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                      account.verified
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {account.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {new Date(account.createdAt).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </TableCell>

              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                {new Date(account.updatedAt).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </TableCell>

              <TableCell>
                <div className="flex justify-center">
                  <TableActionMenu
                    label={`Actions for ${account.name}`}
                    items={[
                      {
                        label: "View Account",
                        icon: <LuEye aria-hidden="true" size={16} animated />,
                        onSelect: () => setAccountToView(account),
                      },
                      ...(account.id !== currentUserId
                        ? [
                            {
                              label:
                                account.role === "alumni"
                                  ? "Promote to Admin"
                                  : "Demote to Alumni",
                              icon: (
                                <LuShieldCheck aria-hidden="true" size={16} />
                              ),
                              onSelect: () => {
                                setRoleConfirmation("");
                                setRoleChange({
                                  account,
                                  role:
                                    account.role === "alumni"
                                      ? "admin"
                                      : "alumni",
                                });
                              },
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal
        open={accountToView !== null}
        onClose={() => setAccountToView(null)}
        title="Account details"
        description={accountToView?.email}
        width="md"
        fitContent
      >
        {accountToView && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  name={accountToView.name}
                  pictureUrl={accountToView.pictureUrl}
                  size={56}
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full name
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {accountToView.name || "Unnamed User"}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  accountToView.verified
                    ? "bg-success/15 text-success"
                    : "bg-warning/15 text-warning"
                }`}
              >
                {accountToView.verified ? "Verified" : "Pending"}
              </span>
            </div>

            <dl className="grid gap-4 rounded-2xl border border-border bg-muted p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </dt>
                <dd className="mt-1 font-medium capitalize text-foreground">
                  {accountToView.role}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account ID
                </dt>
                <dd className="mt-1 break-all text-sm text-foreground">
                  {accountToView.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(accountToView.createdAt).toLocaleString("en-PH")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Updated
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(accountToView.updatedAt).toLocaleString("en-PH")}
                </dd>
              </div>
            </dl>

            {accountToView.id !== currentUserId && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                {accountToView.role === "alumni" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const account = accountToView;
                      setAccountToView(null);
                      setDeleteConfirmation("");
                      setAccountToDelete(account);
                    }}
                  >
                    <LuTrash2 aria-hidden="true" animated />
                    Delete Account
                  </Button>
                )}
                <Button
                  type="button"
                  variant={
                    accountToView.role === "alumni" ? "success" : "destructive"
                  }
                  onClick={() => {
                    const account = accountToView;
                    setAccountToView(null);
                    setRoleConfirmation("");
                    setRoleChange({
                      account,
                      role: account.role === "alumni" ? "admin" : "alumni",
                    });
                  }}
                >
                  <LuShieldCheck aria-hidden="true" />
                  {accountToView.role === "alumni"
                    ? "Promote to Admin"
                    : "Demote to Alumni"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={accountToDelete !== null}
        onClose={() => {
          if (deleting) return;
          setAccountToDelete(null);
          setDeleteConfirmation("");
        }}
        title="Permanently delete account?"
        description={accountToDelete?.email}
        width="md"
        fitContent
        showCloseButton={!deleting}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-destructive">
            <p className="font-semibold">This action cannot be undone</p>
            <p className="mt-1">
              The login account, all draft responses, draft manual imports,
              draft documents, and their Google Drive folders will be
              permanently deleted.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              After deletion:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>The person can no longer sign in with this account</li>
              <li>
                All unfinished drafts and their files are permanently removed
              </li>
              <li>
                Submitted tracer responses remain available as institutional
                records
              </li>
              <li>A new sign-in may create a separate account in the future</li>
            </ul>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Type <strong>DELETE ACCOUNT</strong> to continue
            </span>
            <Input
              className="mt-2"
              value={deleteConfirmation}
              disabled={deleting}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => {
                setAccountToDelete(null);
                setDeleteConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || deleteConfirmation !== "DELETE ACCOUNT"}
              onClick={() => void confirmDelete()}
            >
              {deleting ? "Deleting account..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={roleChange !== null}
        onClose={closeRoleChange}
        title={
          roleChange?.role === "admin"
            ? "Promote account to administrator?"
            : "Demote administrator to alumni?"
        }
        description={roleChange?.account.email}
        width="md"
        fitContent
        showCloseButton={!changingRole}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-warning">
            <p className="font-semibold">Important data and access warning</p>
            <p className="mt-1">
              Changing this role permanently deletes every draft owned by this
              account, including draft alumni responses, draft manual imports,
              uploaded documents, and their Google Drive folders. Submitted
              responses and completed manual imports are retained. Draft
              deletion cannot be undone, and available features change
              immediately.
            </p>
          </div>

          {roleChange?.role === "admin" ? (
            <div>
              <p className="text-sm font-semibold text-foreground">
                This person will receive access to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                <li>All alumni responses and personally identifiable data</li>
                <li>Manual response creation, editing, imports, and exports</li>
                <li>Study scheduling, opening, closing, and archiving</li>
                <li>Google Drive folders, uploads, downloads, and deletion</li>
                <li>Account deletion and administrator role management</li>
              </ul>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Submitted alumni responses remain stored, but all drafts are
                permanently deleted. This account will use the administrator
                portal after its next authorization check.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">
                This person will lose access to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                <li>The admin dashboard and all-account response views</li>
                <li>Manual response and import management</li>
                <li>Study scheduling and lifecycle controls</li>
                <li>Google Drive administration and system-wide exports</li>
                <li>Account deletion and role management</li>
              </ul>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Completed manual imports remain available to other
                administrators, and submitted alumni responses remain associated
                with the account. All drafts are permanently deleted. They will
                regain alumni survey access.
              </p>
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Type <strong>{requiredRoleConfirmation}</strong> to continue
            </span>
            <Input
              className="mt-2"
              value={roleConfirmation}
              disabled={changingRole}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setRoleConfirmation(event.target.value)}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={changingRole}
              onClick={closeRoleChange}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                changingRole || roleConfirmation !== requiredRoleConfirmation
              }
              onClick={() => void confirmRoleChange()}
            >
              {changingRole
                ? "Changing role..."
                : roleChange?.role === "admin"
                  ? "Promote to Admin"
                  : "Demote to Alumni"}
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex flex-wrap gap-3 border-t border-border bg-muted/40 p-4 text-sm sm:px-6">
        {totalRows > 1 ? (
          <span className="w-full rounded-lg bg-muted/60 px-4 py-2 font-semibold whitespace-nowrap text-muted-foreground sm:w-fit">
            Showing <span>{accounts.length}</span> of{" "}
            <span>{totalRows} Entries</span>
          </span>
        ) : (
          <span className="w-full rounded-lg bg-muted/60 px-4 py-2 font-semibold whitespace-nowrap text-muted-foreground sm:w-fit">
            Showing 1 Entry
          </span>
        )}

        <div className="flex w-full gap-2 sm:ml-auto sm:w-fit">
          <Button
            className="flex-1 sm:flex-none"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>

          <Button
            className="flex-1 sm:flex-none"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            variant="default"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
