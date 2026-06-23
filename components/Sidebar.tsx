"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  RiArrowLeftSLine, 
  RiCloudLine, 
  RiFootprintLine, 
  RiHome6Line, 
  RiLogoutCircleLine, 
  RiQuestionLine, 
  RiSettingsLine, 
  RiSurveyLine 
} from "react-icons/ri";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside 
          className={`z-1 fixed flex flex-col py-8 px-2 bg-accent gap-3 h-svh ${
            isOpen ? "w-75 max-w-5/6" : "w-20"
          }`}
        >
          <div className={`py-3 px-6 flex flex-col items-center h-fit justify-center`}>
            <span className="shrink-0 inline-flex items-center justify-center">
              <RiFootprintLine size={32}/>
            </span>
            <h1 className={`text-2xl font-bold text-center whitespace-nowrap ${
              isOpen ? "" : "opacity-0 w-0 overflow-hidden"
            }`}>
              Tracer System 
            </h1>
            <span className={`text-xs font-medium bg-surface/10 rounded-full ${
              isOpen ? "py-1 px-2" : "opacity-0 w-0 overflow-hidden"
            }`}>v1</span>
          </div>

          <div className="flex flex-col w-full h-fit gap-2 mt-3">
            <Link 
              href="/" 
              className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
                isOpen ? "justify-start px-6" : "justify-center"
              }`}
            >
              <span className="shrink-0 inline-flex items-center justify-center">
                <RiHome6Line size={28}/>
              </span>
              <p className={`font-semibold whitespace-nowrap origin-left ${
                isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}>
                Home
              </p>
            </Link>

            <Link 
              href="/forms" 
              className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
                isOpen ? "justify-start px-6" : "justify-center"
              }`}
            >
              <span className="shrink-0 inline-flex items-center justify-center">
                <RiSurveyLine size={28}/>
              </span>
              <p className={`font-semibold whitespace-nowrap origin-left ${
                isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}>
                Forms
              </p>
            </Link>

            <Link 
              href="/faqs" 
              className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
                isOpen ? "justify-start px-6" : "justify-center"
              }`}
            >
              <span className="shrink-0 inline-flex items-center justify-center">
                <RiQuestionLine size={28}/>
              </span>
              <p className={`font-semibold whitespace-nowrap origin-left ${
                isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}>
                FAQs
              </p>
            </Link>
          </div>

          <div className="flex flex-col w-full gap-1 mt-3 flex-1 justify-end">
            <Link 
              href="/manage-uploads" 
              className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
                isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
              }`}
            >
              <RiCloudLine size={18}/>
              <p className={`text-sm font-medium whitespace-nowrap ${
                isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}>
                Manage Uploads
              </p>
            </Link>

            <Link 
              href="/settings" 
              className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
                isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
              }`}
            >
              <RiSettingsLine size={18}/>
              <p className={`text-sm font-medium whitespace-nowrap ${
                isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}>
                Settings
              </p>
            </Link>

            <Link 
              href="/" 
              className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
                isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
              }`}
            >
              <RiLogoutCircleLine size={18}/>
              <p className={`text-sm font-medium whitespace-nowrap ${
                isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              }`}>
                Sign Out
              </p>
            </Link>
          </div>

          <div 
            onClick={(e) => setIsOpen(!isOpen)}
            className="flex flex-row w-fit h-fit p-1 rounded-2xl bg-white border-4 border-accent gap-3 mt-3 text-accent absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-surface active:scale-95 transition-all ease-out duration-300 layout"
          >
            <RiArrowLeftSLine 
              size={32} 
              className={`${!isOpen ? "rotate-180" : ""}`}
            />
          </div>  
        </aside>
        <div 
          className={`h-dvh ${
            isOpen ? "lg:w-75" : "lg:w-20"
          }`}
        />
    </>
  );
}