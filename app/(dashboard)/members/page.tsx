// app/members/page.tsx
import Link from "next/link";
import { getPaginatedMembers } from "@/app/api/appwrite/appwrite";
import { RefreshMembersButton } from "@/components/RefreshMembersButton";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const limit = 5;
  const offset = (currentPage - 1) * limit;

  let members: any[] = [];
  let totalUsers = 0;
  let error: string | null = null;

  try {
    const data = await getPaginatedMembers(limit, offset);
    members = data.users;
    totalUsers = data.total;
  } catch (err) {
    error =
      "Failed to load user accounts. Please check your server configuration.";
  }

  const totalPages = Math.ceil(totalUsers / limit) || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  return (
    <div className="h-fit text-slate-900">
      <div className="">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-accent">
              Members
            </h1>
            <p className="text-sm text-foreground">
              A list of members registered in the system.
            </p>
          </div>
          <div className="flex flex-row gap-2 justify-between md:justify-end">
            <div className="text-xs font-medium px-3 py-1.5 bg-slate-200/60 text-slate-600 rounded-md">
              Total Users: {totalUsers}
            </div>
            <RefreshMembersButton />
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
            <p className="text-sm text-slate-500">
              No accounts found in this project.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4">Verification Status</th>
                      <th className="px-6 py-4">Role(s)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {members.map((member) => (
                      <tr
                        key={member.$id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                          {member.name || (
                            <span className="italic text-slate-400">
                              Unnamed
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {member.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {new Date(member.registration).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 w-full text-sm">
                          {member.emailVerification ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/10">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600 ring-1 ring-inset ring-yellow-600/10">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {member.labels.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {member.labels.map((label: string) => (
                                <span
                                  key={label}
                                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm italic text-slate-400">
                              No role assigned
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination UI Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-800">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {totalPages}
                </span>
              </span>

              <div className="flex gap-2">
                {hasPrevPage ? (
                  <Link
                    href={`/members?page=${currentPage - 1}`}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
                  >
                    Previous
                  </Link>
                ) : (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 font-medium text-slate-400"
                  >
                    Previous
                  </button>
                )}

                {hasNextPage ? (
                  <Link
                    href={`/members?page=${currentPage + 1}`}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
                  >
                    Next
                  </Link>
                ) : (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 font-medium text-slate-400"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
