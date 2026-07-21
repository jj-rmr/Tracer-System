import { requireUserRole } from "@/lib/auth";
import { ROLES } from "@/types";
import Image from "next/image";

export default async function AlumniPage() {
  const user = await requireUserRole([ROLES.ALUMNI]);

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
          Welcome Back, {user?.name}
        </h1>

        <p className="md:mt-2 text-sm md:text-lg text-slate-600">
          You are currently signed in as an alumni.
        </p>
      </div>
    </div>
  );
}
