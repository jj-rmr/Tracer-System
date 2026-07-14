import { SignOutButton } from "@/components/SignOutButton";

export default function AlumniSetting() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <div className="text-left w-full max-w-5xl flex flex-col gap-24">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-12">
          Settings
        </h1>
        <div className="inline-flex w-full items-center justify-center">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
