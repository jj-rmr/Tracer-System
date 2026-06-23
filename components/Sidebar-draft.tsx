import Link from "next/link";
import { RiArrowLeftSLine, RiCloudLine, RiFootprintLine, RiHome6Line, RiLogoutCircleLine, RiQuestionLine, RiSettingsLine, RiSurveyLine } from "react-icons/ri";

export default function Sidebar() {
  return (
    <aside className="relative flex flex-col py-8 px-6 w-1/6 min-w-80 bg-accent gap-3">
        <div className="py-3 px-6 justify-center items-center flex h-fit gap-4">
            <RiFootprintLine size={32}/>
            <h1 className="text-2xl font-bold text-center">Tracer System</h1>
        </div>
        <div className="flex flex-col w-full h-fit gap-2 mt-3">
        <Link href="/" className="flex flex-row items-center justify-start w-full h-fit px-6 py-4 rounded-2xl bg-surface/10 gap-3 cursor-pointer hover:bg-surface/20 active:scale-95 transition-transform">
            <RiHome6Line size={28}/>
            <p className="font-semibold">Home</p>
        </Link>
        <Link href="/forms" className="flex flex-row items-center justify-start w-full h-fit px-6 py-4 rounded-2xl bg-surface/10 gap-3 cursor-pointer hover:bg-surface/20 active:scale-95 transition-transform">
            <RiSurveyLine size={28}/>
            <p className="font-semibold">Forms</p>
        </Link>
        <Link href="/faqs" className="flex flex-row items-center justify-start w-full h-fit px-6 py-4 rounded-2xl bg-surface/10 gap-3 cursor-pointer hover:bg-surface/20 active:scale-95 transition-transform">
            <RiQuestionLine size={28}/>
            <p className="font-semibold">FAQs</p>
        </Link>
        </div>
        <div className="flex flex-col w-full gap-1 mt-3 flex-1 justify-end">
        <Link href="/manage-uploads" className="flex flex-row items-center justify-start w-full h-fit px-3 py-2 gap-3 cursor-pointer hover:text-surface active:scale-95 transition-transform">
            <RiCloudLine size={18}/>
            <p className="text-sm font-medium">Manage Uploads</p>
        </Link>
        <Link href="/settings" className="flex flex-row items-center justify-start w-full h-fit px-3 py-2 gap-3 cursor-pointer hover:text-surface active:scale-95 transition-transform">
            <RiSettingsLine size={18}/>
            <p className="text-sm font-medium">Settings</p>
        </Link>
        <Link href="/signout" className="flex flex-row items-center justify-start w-full h-fit px-3 py-2 gap-3 cursor-pointer hover:text-surface active:scale-95 transition-transform">
            <RiLogoutCircleLine size={18}/>
            <p className="text-sm font-medium">Sign Out</p>
        </Link>
        </div>
        <div className="flex flex-row w-fit h-fit p-1 rounded-2xl bg-white border-4 border-accent gap-3 mt-3 text-accent absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-surface active:scale-95 transition-transform">
            <RiArrowLeftSLine size={32}/>
        </div>
    </aside>
  )};