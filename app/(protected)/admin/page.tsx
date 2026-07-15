import { getCurrentUser, getSessionCookie } from "@/lib/auth";
import Image from "next/image";

export default async function AdminPage() {
  const session = await getSessionCookie();
  const user = await getCurrentUser(session);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100dvh-10.5rem)] md:min-h-[calc(100dvh-4rem)] flex-col items-center justify-center">
        <div className="w-full max-w-5xl text-center">
          <div className="mx-auto mb-8 w-10/12 max-w-80">
            <Image
              src="/placement-logo.png"
              alt="Placement Unit Logo"
              width={512}
              height={512}
              className="h-auto w-full"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Unauthorized Access
          </h1>
        </div>
      </div>
    );
  }

  return (
    // <div className="flex flex-col gap-8 items-center justify-center">
    //   <div className="text-center w-full max-w-5xl">
    //     <h1 className="text-xl font-bold tracking-tight text-slate-900">
    //       Welcome Back, {user.name}
    //     </h1>
    //     <p className="text-slate-600">
    //       You are currently signed in as an admin.
    //     </p>
    //     <Image
    //       src="/placement-logo.png"
    //       alt="Placement Unit Logo"
    //       width={32}
    //       height={32}
    //     />
    //   </div>
    // </div>
    <div className="flex min-h-[calc(100dvh-10.5rem)] md:min-h-[calc(100dvh-4rem)] flex-col items-center justify-center">
      <div className="w-full max-w-5xl text-center">
        <div className="mx-auto mb-8 w-10/12 max-w-80">
          <Image
            src="/placement-logo.png"
            alt="Placement Unit Logo"
            width={512}
            height={512}
            className="h-auto w-full"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome Back, {user.name}
        </h1>

        <p className="mt-2 text-lg text-slate-600">
          You are currently signed in as an admin.
        </p>
      </div>
    </div>
  );
}
