import Link from "next/link";
import { LuFileInput } from "react-icons/lu";

const FORMS_DATA = [
  { title: "Form A", href: "/forms/form-a" },
  { title: "Form B", href: "/forms/form-b" },
  { title: "Form C", href: "/forms/form-c" },
];

export default function Forms() {
  return (
    <div className="w-full max-w-6xl min-h-fit h-screen">
      <h1 className="text-3xl font-bold">Forms</h1>
      <p className="text-foreground">This is the Forms page.</p>
      
      <div className="flex flex-col gap-2 mt-8 md:mt-12 justify-center items-center">
        {FORMS_DATA.map((form) => (
          <Link 
            key={form.href} 
            href={form.href} 
            className="flex flex-row gap-4 items-center w-full lg:max-w-10/12 h-fit border border-sky-200 hover:bg-sky-100 hover:text-sky-400 hover:transform active:scale-95 rounded-2xl transition-color duration-300 px-4 py-6"
          >
            <LuFileInput size={24} />
            <p className="font-semibold">{form.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}