import { requireAdmin } from "@/lib/auth";
import Image from "next/image";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-[calc(100dvh-10.5rem)] md:min-h-[calc(100dvh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-5xl text-center">
        <div className="mx-auto mb-8 w-10/12 max-w-80">
          <Image
            src="/placement-logo.png"
            alt="Placement Unit Logo"
            width={512}
            height={512}
            className="h-auto w-full shadow-2xl rounded-full"
            priority
          />
        </div>

        <h1 className="text-base font-semibold tracking-tight text-slate-900 md:text-3xl">
          Welcome Back, {user.name}
        </h1>

        <p className="md:mt-2 text-sm md:text-lg text-slate-600">
          You are currently signed in as an admin.
        </p>
      </div>
    </div>
  );
}
