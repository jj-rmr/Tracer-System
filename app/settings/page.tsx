import Link from "next/link";

export default function Settings() {
  return (
    <div className="w-full max-w-6xl h-fit">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-foreground">This is the settings page.</p>
        <div className="flex flex-col gap-2 mt-8 md:mt-12 items-center">
          <div className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Account</p>
            </div>
            <div className="mt-4 text-foreground">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
          <div className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Security</p>
            </div>
            <div className="mt-4 text-foreground">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
          <div className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Support</p>
            </div>
            <div className="mt-4 text-foreground">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
          <Link href="/settings/faqs" className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">FAQs</p>
            </div>
            <div className="mt-4 text-foreground">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </Link>
          <div className="mt-8 md:mt-12 w-fit h-fit rounded-2xl px-6 py-4 flex flex-col items-start hover:bg-red-200 bg-red-400 hover:text-red-400 text-white border border-red-200 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Sign Out</p>
            </div>
          </div>
        </div>
    </div>
  );
}
