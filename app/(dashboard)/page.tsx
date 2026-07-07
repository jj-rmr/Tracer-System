import { getSessionUser } from "@/app/actions/cache";

export default async function Page() {
  const user = await getSessionUser();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-sky-100 rounded-2xl border border-sky-200">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-sky-800">
            Welcome back, {user?.name || "Admin"}!
          </h1>
          <p className="text-sm text-sky-400 mt-1">
            Logged in as:{" "}
            <span className="font-medium text-sky-600">{user?.email}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-none shadow-sky-100 border border-sky-50 hover:shadow-md transition-[shadow,box-shadow,translate] duration-300 hover:-translate-y-1">
          <p className="text-sm font-medium text-sky-500">
            Total Alumni Traced
          </p>
          <p className="text-3xl font-bold text-sky-900 mt-2">1,248</p>
          <span className="text-xs text-green-600 font-medium mt-1 inline-block">
            ↑ 12% this graduate batch
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-none shadow-sky-100 border border-sky-50 hover:shadow-md transition-[shadow,box-shadow,translate] duration-300 hover:-translate-y-1">
          <p className="text-sm font-medium text-sky-500">Employment Rate</p>
          <p className="text-3xl font-bold text-sky-900 mt-2">84.3%</p>
          <span className="text-xs text-sky-400 mt-1 inline-block">
            Based on responses
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-none shadow-sky-100 border border-sky-50 hover:shadow-md transition-[shadow,box-shadow,translate] duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-sky-500">Pending Surveys</p>
          <p className="text-3xl font-bold text-sky-900 mt-2">43</p>
          <span className="text-xs text-amber-600 font-medium mt-1 inline-block">
            Requires follow-up
          </span>
        </div>
      </div>
    </div>
  );
}
