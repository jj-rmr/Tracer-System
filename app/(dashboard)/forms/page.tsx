"use client";
import AppwriteDataTable from "@/components/AppwriteDataTable";
import Link from "next/link";
import { LuFileInput } from "react-icons/lu";

const FORMS_DATA = [
  { title: "Graduate Tracer Study", href: "/forms/GraduateTracerStudy" },
];

export default function Forms() {
  return (
    <>
      <h1 className="text-3xl font-bold">Forms</h1>
      <p className="text-sm   text-foreground">This is the Forms page.</p>

      <div className="flex flex-col gap-2 mt-8 md:mt-12 justify-center items-center">
        {FORMS_DATA.map((form) => (
          <Link
            key={form.href}
            href={form.href}
            className="flex flex-row gap-2 items-center w-full lg:max-w-10/12 h-fit bg-white shadow-none shadow-sky-100 border border-sky-50 hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-95 active:bg-sky-100 rounded-2xl transition-color duration-300 px-4 py-6"
          >
            <LuFileInput size={18} />
            <p className="font-semibold">{form.title}</p>
          </Link>
        ))}
        <AppwriteDataTable />
      </div>
    </>
  );
}
