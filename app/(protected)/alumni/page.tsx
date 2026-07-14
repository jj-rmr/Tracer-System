import { getCurrentUser, getSessionCookie } from "@/lib/auth";

export default async function AlumniPage() {
  const session = await getSessionCookie();
  const user = await getCurrentUser(session);

  if (!user) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center">
        <div className="text-center w-full max-w-5xl">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Unauthorized Access
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <div className="text-center w-full max-w-5xl">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Welcome Back, {user.name}
        </h1>
        <p className="text-slate-600">
          You are currently signed in as an alumni.
        </p>
      </div>
    </div>
  );
}
