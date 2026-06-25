// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { 
//   RiArrowLeftSLine, 
//   RiCloudLine, 
//   RiFootprintLine, 
//   RiHome6Line, 
//   RiLogoutCircleLine, 
//   RiQuestionLine, 
//   RiSettingsLine, 
//   RiSurveyLine 
// } from "react-icons/ri";

// export default function Sidebar() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
//       <aside 
//           className={`z-1 fixed flex flex-col py-8 px-2 bg-accent gap-3 h-svh ${
//             isOpen ? "w-75 max-w-5/6" : "w-20"
//           }`}
//         >
//           <div className={`py-3 px-6 flex flex-col items-center h-fit justify-center`}>
//             <span className="shrink-0 inline-flex items-center justify-center">
//               <RiFootprintLine size={32}/>
//             </span>
//             <h1 className={`text-2xl font-bold text-center whitespace-nowrap ${
//               isOpen ? "" : "opacity-0 w-0 overflow-hidden"
//             }`}>
//               Tracer System 
//             </h1>
//             <span className={`text-xs font-medium bg-surface/10 rounded-full ${
//               isOpen ? "py-1 px-2" : "opacity-0 w-0 overflow-hidden"
//             }`}>v1</span>
//           </div>

//           <div className="flex flex-col w-full h-fit gap-2 mt-3">
//             <Link 
//               href="/" 
//               className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
//                 isOpen ? "justify-start px-6" : "justify-center"
//               }`}
//             >
//               <span className="shrink-0 inline-flex items-center justify-center">
//                 <RiHome6Line size={28}/>
//               </span>
//               <p className={`font-semibold whitespace-nowrap origin-left ${
//                 isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
//               }`}>
//                 Home
//               </p>
//             </Link>

//             <Link 
//               href="/forms" 
//               className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
//                 isOpen ? "justify-start px-6" : "justify-center"
//               }`}
//             >
//               <span className="shrink-0 inline-flex items-center justify-center">
//                 <RiSurveyLine size={28}/>
//               </span>
//               <p className={`font-semibold whitespace-nowrap origin-left ${
//                 isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
//               }`}>
//                 Forms
//               </p>
//             </Link>

//             <Link 
//               href="/faqs" 
//               className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
//                 isOpen ? "justify-start px-6" : "justify-center"
//               }`}
//             >
//               <span className="shrink-0 inline-flex items-center justify-center">
//                 <RiQuestionLine size={28}/>
//               </span>
//               <p className={`font-semibold whitespace-nowrap origin-left ${
//                 isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
//               }`}>
//                 FAQs
//               </p>
//             </Link>
//           </div>

//           <div className="flex flex-col w-full gap-1 mt-3 flex-1 justify-end">
//             <Link 
//               href="/manage-uploads" 
//               className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
//                 isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
//               }`}
//             >
//               <RiCloudLine size={18}/>
//               <p className={`text-sm font-medium whitespace-nowrap ${
//                 isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
//               }`}>
//                 Manage Uploads
//               </p>
//             </Link>

//             <Link 
//               href="/settings" 
//               className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
//                 isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
//               }`}
//             >
//               <RiSettingsLine size={18}/>
//               <p className={`text-sm font-medium whitespace-nowrap ${
//                 isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
//               }`}>
//                 Settings
//               </p>
//             </Link>

//             <Link 
//               href="/" 
//               className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
//                 isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
//               }`}
//             >
//               <RiLogoutCircleLine size={18}/>
//               <p className={`text-sm font-medium whitespace-nowrap ${
//                 isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
//               }`}>
//                 Sign Out
//               </p>
//             </Link>
//           </div>

//           <div 
//             onClick={(e) => setIsOpen(!isOpen)}
//             className="flex flex-row w-fit h-fit p-1 rounded-2xl bg-white border-4 border-accent gap-3 mt-3 text-accent absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-surface active:scale-95 transition-all ease-out duration-300 layout"
//           >
//             <RiArrowLeftSLine 
//               size={32} 
//               className={`${!isOpen ? "rotate-180" : ""}`}
//             />
//           </div>  
//         </aside>
//         <div 
//           className={`h-dvh ${
//             isOpen ? "lg:w-75" : "lg:w-20"
//           }`}
//         />
//     </>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  RiArrowLeftSLine, 
  RiCloudLine, 
  RiFootprintLine, 
  RiHome3Line, 
  RiLogoutCircleLine, 
  RiQuestionLine, 
  RiSettingsLine, 
  RiSurveyLine 
} from "react-icons/ri";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const mainNavItems = [
    { label: "Home", href: "/", icon: RiHome3Line },
    { label: "Forms", href: "/forms", icon: RiSurveyLine },
    { label: "FAQs", href: "/faqs", icon: RiQuestionLine },
  ];

  const secondaryNavItems = [
    { label: "Uploads", href: "/manage-uploads", icon: RiCloudLine },
    { label: "Settings", href: "/settings", icon: RiSettingsLine },
    { label: "Sign Out", href: "/logout", icon: RiLogoutCircleLine },
  ];

  return (
    <>
      <aside 
        className={`z-10 fixed hidden md:flex flex-col py-8 px-2 gap-3 h-svh transition-all ease-out duration-300 ${
          isOpen ? "w-75 max-w-5/6" : "w-20"
        }`}
      >
        <div className="py-3 px-6 flex flex-col items-center h-fit justify-center">
          <span className="shrink-0 inline-flex items-center justify-center">
            <RiFootprintLine size={32}/>
          </span>
          <h1 className={`text-2xl font-bold text-center whitespace-nowrap transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          }`}>
            Tracer System 
          </h1>
          <span className={`text-xs font-medium bg-surface/10 rounded-full transition-all duration-300 ${
            isOpen ? "py-1 px-2 opacity-100" : "opacity-0 w-0 overflow-hidden"
          }`}>
            v1
          </span>
        </div>
        
        <div className="flex flex-col w-full h-fit gap-2 mt-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex flex-row items-center w-full h-fit p-4 rounded-2xl bg-surface/10 cursor-pointer hover:bg-surface/20 active:scale-95 transition-all ease-out duration-300 ${
                  isOpen ? "justify-start px-6" : "justify-center"
                }`}
              >
                <span className="shrink-0 inline-flex items-center justify-center">
                  <Icon size={28}/>
                </span>
                <p className={`font-semibold whitespace-nowrap origin-left transition-all duration-300 ${
                  isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                }`}>
                  {item.label}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col w-full gap-1 mt-3 flex-1 justify-end">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex flex-row items-center w-full h-fit cursor-pointer hover:text-surface active:scale-95 transition-all ease-out duration-300 ${
                  isOpen ? "justify-start px-3 py-2" : "justify-center p-3"
                }`}
              >
                <Icon size={18}/>
                <p className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isOpen ? "ml-3 opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                }`}>
                  {item.label === "Uploads" ? "Manage Uploads" : item.label}
                </p>
              </Link>
            );
          })}
        </div>

        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-row w-fit h-fit p-1 rounded-2xl bg-white border-4 border-accent gap-3 mt-3 text-accent absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-surface active:scale-95 transition-all ease-out duration-300 layout"
        >
          <RiArrowLeftSLine 
            size={32} 
            className={`transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`}
          />
        </div>  
      </aside>
      <div 
        className={`hidden md:block h-dvh bg-accent transition-[width] ease-out duration-300 ${
          isOpen ? "md:w-75" : "md:w-20"
        }`}
      />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-accent border-t border-surface/10 px-4 py-2 block md:hidden pb-safe">
        <div className="flex justify-around items-center w-full max-w-md mx-auto">
          {[
            ...mainNavItems,
            { label: "Uploads", href: "/manage-uploads", icon: RiCloudLine },
            { label: "Settings", href: "/settings", icon: RiSettingsLine }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-center transition-all duration-200 active:scale-90 ${
                  isActive ? "text-white bg-surface/20" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium mt-1 truncate w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}