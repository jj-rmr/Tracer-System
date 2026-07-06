"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuPanelLeftClose,
  LuCloud,
  LuUserRoundSearch,
  LuHouse,
  LuSettings2,
  LuFileSpreadsheet,
  LuPanelLeftOpen,
} from "react-icons/lu";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const mainNavItems = [
    { label: "Home", href: "/", icon: LuHouse },
    { label: "Forms", href: "/forms", icon: LuFileSpreadsheet },
  ];

  const secondaryNavItems = [
    { label: "Settings", href: "/settings", icon: LuSettings2 },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <aside
        className={`z-10 fixed hidden md:flex flex-col py-8 px-2 gap-3 h-svh transition-all ease-out duration-300 text-accent overflow-y-auto overflow-x-hidden ${
          isOpen ? "w-75 max-w-5/6" : "w-20"
        }`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`right-6 p-1 rounded-lg absolute flex flex-row w-fit h-fit place-self-center gap-3 mt-3 text-sky-300 cursor-pointer hover:bg-sky-100 active:bg-sky-100 active:scale-95 transition-all ease-out duration-300
            ${isOpen ? "top-7.5" : "top-1"}`}
        >
          <LuPanelLeftOpen
            size={24}
            className={`${isOpen ? "hidden" : ""}`}
            strokeWidth={1}
          />
          <LuPanelLeftClose
            size={24}
            className={`${isOpen ? "" : "hidden"}`}
            strokeWidth={1}
          />
        </div>
        <div
          className={`p-2 pl-4 flex flex-row gap-3 items-center h-fit justify-start transition-margin duration-300 ${
            isOpen ? "mt-0" : "mt-4"
          }`}
        >
          <span className="shrink-0 inline-flex items-center justify-center">
            <LuUserRoundSearch size={32} />
          </span>
          <h1
            className={`text-3xl font-bold text-center whitespace-nowrap transition-all duration-300 ${
              isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Tracer
          </h1>
        </div>

        <div className="flex flex-col w-full h-fit gap-2 mt-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-row items-center w-full h-fit pl-[19] py-4 rounded-2xl outline outline-sky-200 cursor-pointer hover:text-sky-400 hover:bg-sky-100 active:text-sky-400 active:bg-sky-50 active:scale-95 transition-all ease-out duration-300 ${
                  isActiveLink(item.href) ? "bg-sky-100 text-sky-500" : ""
                }`}
              >
                <span className="shrink-0 inline-flex items-center justify-center">
                  <Icon size={24} />
                </span>
                <p
                  className={`font-semibold whitespace-nowrap origin-left transition-all duration-300 ${
                    isOpen
                      ? "ml-3 opacity-100 w-auto"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
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
                className={`pl-5.5 py-2 flex flex-row items-center w-full h-fit cursor-pointer hover:text-sky-400 active:text-sky-400 active:scale-95 transition-all ease-out duration-300 ${
                  isActiveLink(item.href) ? "text-sky-500" : ""
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <p
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isOpen ? "ml-3 opacity-100" : "opacity-0 overflow-hidden"
                  }`}
                >
                  {item.label === "Uploads" ? "Manage Uploads" : item.label}
                </p>
              </Link>
            );
          })}
        </div>
      </aside>
      <div
        className={`hidden md:block h-dvh bg-transparent border-r border-sky-200  transition-[width] ease-out duration-300 ${
          isOpen ? "md:w-75" : "md:w-20"
        }`}
      />

      <nav className="fixed bottom-0 left-0 right-0 z-1000 bg-background border-t shadow-2xl border-accent/20 px-4 py-2 block md:hidden pb-safe">
        <div className="flex justify-around items-center w-full max-w-md mx-auto">
          {[...mainNavItems, ...secondaryNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-center transition-all duration-200 active:scale-90 ${
                  isActive ? "text-accent bg-sky-50 " : ""
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
