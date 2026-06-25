export default function Settings() {
  return (
    <div className="w-full max-w-6xl px-6 py-12 h-screen">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-slate-600">This is the settings page.</p>
        <div className="flex flex-col gap-2 mt-8 items-center">
          <div className="w-full max-w-200 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Account</p>
            </div>
            <div className="mt-4 text-slate-600">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
          <div className="w-full max-w-200 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Security</p>
            </div>
            <div className="mt-4 text-slate-600">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
          <div className="w-full max-w-200 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Support</p>
            </div>
            <div className="mt-4 text-slate-600">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
          <div className="w-full max-w-200 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">Sign Out</p>
            </div>
            <div className="mt-4 text-slate-600">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, facere!</div>
          </div>
        </div>
    </div>
  );
}
