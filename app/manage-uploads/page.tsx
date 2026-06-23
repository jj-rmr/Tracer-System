import { RiCheckboxCircleLine, RiCloseCircleLine, RiDeleteBinLine, RiRestartLine, RiStopCircleLine, RiUploadCloudLine } from "react-icons/ri";

export default function ManageUploads() {
  return (
    <div className="w-full max-w-6xl px-6 py-12 h-screen">
      <h1 className="text-3xl font-bold">Manage Uploads</h1>
      <p className="text-slate-600">This is the manage uploads page.</p>
      <div className="flex flex-col gap-2 mt-8 items-center">
        <div className="w-full max-w-100 h-fit border-2 border-surface/50 rounded-2xl p-4 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <RiUploadCloudLine size={24} className="text-blue-400"/>
            <p className="font-semibold">Form A</p>
          </div>
          <div className="flex gap-2 items-center">
            
            <RiStopCircleLine size={24} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
            <RiDeleteBinLine size={24} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
          </div>
        </div>
        <div className="w-full max-w-100 h-fit border-2 border-surface/50 rounded-2xl p-4 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <RiCheckboxCircleLine size={24} className="text-green-400"/>
            <p className="font-semibold">Form B</p>
          </div>
          <div className="flex gap-2 items-center">
            <RiDeleteBinLine size={24} className="hover:opacity-50 active:scale-95 cursor-pointer"/>            
          </div>

        </div>
        <div className="w-full max-w-100 h-fit border-2 border-surface/50 rounded-2xl p-4 flex flex-row justify-between items-center">
          <div className="flex gap-2 items-center">
            <RiCloseCircleLine size={24} className="text-red-400"/>
            <p className="font-semibold">Form C</p>          
          </div>
          <div className="flex gap-2 items-center">
            <RiRestartLine size={24} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
            <RiDeleteBinLine size={24} className="hover:opacity-50 active:scale-95 cursor-pointer"/>
          </div>
        </div>
      </div>
    </div>
  );
}
