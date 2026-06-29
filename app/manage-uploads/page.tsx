import { LuRefreshCw , LuFileCheck2, LuFileClock, LuFileX2, LuX, LuFileMinus2 } from "react-icons/lu";

export default function ManageUploads() {
  return (
    <>
      <h1 className="text-3xl font-bold">Manage Uploads</h1>
      <p className="text-foreground">This is the manage uploads page.</p>
      <div className="flex flex-col gap-2 mt-8 md:mt-12 items-center">
        <div className="w-full lg:max-w-8/12 h-fit border border-sky-200 rounded-2xl px-4 py-6 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <LuFileClock size={18} className="text-blue-400"/>
            <p className="font-semibold">Form A</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-blue-400 text-xs">Waiting</p>
            <LuX size={18} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
          </div>
        </div>
        <div className="w-full lg:max-w-8/12 h-fit border border-sky-200 rounded-2xl px-4 py-6 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <LuFileCheck2 size={18} className="text-green-400"/>
            <p className="font-semibold">Form B</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-green-400 text-xs">Success</p>
          </div>
        </div>
        <div className="w-full lg:max-w-8/12 h-fit border border-sky-200 rounded-2xl px-4 py-6 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <LuFileX2 size={18} className="text-red-400"/>
            <p className="font-semibold">Form C</p>          
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-red-400 text-xs">Error</p>
            <LuRefreshCw  size={15} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
            <LuX size={18} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
          </div>
        </div>
        <div className="w-full lg:max-w-8/12 h-fit border border-sky-200 rounded-2xl px-4 py-6 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <LuFileMinus2 size={18} className="text-yellow-400"/>
            <p className="font-semibold">Form C</p>          
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-yellow-400 text-xs">Cancelled</p>
          </div>
        </div>
      </div>
    </>
  );
}
