import { RiUploadCloud2Line } from "react-icons/ri";

export default function Forms() {
  return (
    <div className="w-full max-w-6xl px-6 py-12 min-h-fit h-screen">
      <h1 className="text-3xl font-bold">Forms</h1>
      <p className="text-slate-600">This is the Forms page.</p>
      <div className="flex flex-row flex-wrap gap-2 mt-8 justify-center">
        <div className="relative w-full max-w-60 h-60 border-2 border-surface/50 rounded-4xl p-4">
          <p className="font-semibold">Form A</p>
          <RiUploadCloud2Line size={48} className="absolute left-1/2 -translate-1/2 top-1/2"/>
        </div>
        <div className="relative w-full max-w-60 h-60 border-2 border-surface/50 rounded-4xl p-4">
          <p className="font-semibold">Form B</p>
          <RiUploadCloud2Line size={48} className="absolute left-1/2 -translate-1/2 top-1/2"/>
        </div>
        <div className="relative w-full max-w-60 h-60 border-2 border-surface/50 rounded-4xl p-4">
          <p className="font-semibold">Form C</p>
          <RiUploadCloud2Line size={48} className="absolute left-1/2 -translate-1/2 top-1/2"/>
        </div>
      </div>
    </div>
  );
}
