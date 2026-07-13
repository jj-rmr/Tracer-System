"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuUserRoundSearch,
  LuHouse,
  LuSettings2,
  LuFileSpreadsheet,
  LuUsersRound,
  LuGraduationCap,
  LuBriefcaseBusiness,
} from "react-icons/lu";
import { Role } from "@/types";

interface NavProps {
  role: Role;
}

export default function Nav({ role }: NavProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const adminNavItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LuHouse,
    },
    {
      label: "Accounts",
      href: "/admin/accounts",
      icon: LuUsersRound,
    },
    {
      label: "Survey",
      href: "/admin/surveys",
      icon: LuFileSpreadsheet,
    },
  ];

  const alumniNavItems = [
    {
      label: "Dashboard",
      href: "/alumni",
      icon: LuHouse,
    },
    {
      label: "Survey",
      href: "/alumni/survey",
      icon: LuFileSpreadsheet,
    },
  ];

  const secondaryNavItems =
    role === "Admin"
      ? [
          {
            label: "Settings",
            href: "/admin/settings",
            icon: LuSettings2,
          },
        ]
      : [
          {
            label: "Settings",
            href: "/alumni/settings",
            icon: LuSettings2,
          },
        ];

  const mainNavItems = role === "Admin" ? adminNavItems : alumniNavItems;

  const isActiveLink = (href: string) => {
    const allNavItems = [...mainNavItems, ...secondaryNavItems].map(
      (item) => item.href,
    );

    const matchedRoute = allNavItems
      .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
      .sort((a, b) => b.length - a.length)[0];

    return matchedRoute === href;
  };

  return (
    <>
      <aside
        className={`fixed z-10 bg-white shadow-[12px_0_30px_-5px_rgba(0,0,0,0.1)] rounded-r-4xl shadow-sky-100 hidden md:flex flex-col py-8 px-2 gap-3 h-svh transition-all ease-out duration-300 text-accent overflow-y-auto overflow-x-hidden ${
          isOpen ? "w-75 max-w-5/6" : "w-20"
        }`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`right-6 p-1 rounded-lg absolute flex w-fit h-fit gap-3 mt-3 text-sky-300 hover:text-sky-400 bg-white hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-95 active:text-sky-400 transition-all duration-300 ${
            isOpen ? "top-7.5" : "top-1"
          }`}
        >
          {isOpen ? (
            <LuPanelLeftClose size={24} strokeWidth={1} />
          ) : (
            <LuPanelLeftOpen size={24} strokeWidth={1} />
          )}
        </div>

        <div
          className={`p-2 pl-4 flex items-center gap-3 transition-all duration-300 ${
            isOpen ? "mt-0" : "mt-4"
          }`}
        >
          <LuUserRoundSearch size={32} />

          <h1
            className={`text-3xl font-bold whitespace-nowrap transition-all duration-300 ${
              isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Tracer
          </h1>
        </div>

        <div
          className={`w-5 ml-5.5 bg-sky-200 rounded-full transition-all duration-300 ${
            isOpen ? "h-0 opacity-0" : "h-0.5 opacity-100"
          }`}
        />

        <div className="flex flex-col gap-2 mt-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center pl-4.75 py-4 rounded-2xl hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-300 ${
                  isActiveLink(item.href) ? "bg-sky-100 text-sky-500" : ""
                }`}
              >
                <Icon size={24} />

                <span
                  className={`font-semibold whitespace-nowrap transition-all duration-300 ${
                    isOpen
                      ? "ml-3 opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 mt-auto">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pl-5.5 py-2 flex items-center transition-all duration-300 hover:text-sky-400 active:scale-95 ${
                  isActiveLink(item.href) ? "text-sky-500" : ""
                }`}
              >
                <Icon size={18} />

                <span
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isOpen
                      ? "ml-3 opacity-100"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      <div
        className={`hidden md:block transition-all duration-300 ${
          isOpen ? "w-75" : "w-20"
        }`}
      />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background shadow-[0_-12px_30px_-5px_rgba(0,0,0,0.1)] rounded-t-4xl border  border-sky-100 border-b-0 p-2 md:hidden pb-safe">
        <div className="flex justify-around">
          {[...mainNavItems, ...secondaryNavItems].map((item) => {
            const Icon = item.icon;
            const active = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center flex-1 p-2 active:scale-90 ${
                  active ? "text-sky-400" : ""
                }`}
              >
                <Icon size={24} />

                <span className="text-[10px] mt-1">{item.label}</span>

                <div
                  className={`absolute top-1.5 -z-10 h-7.5 w-full max-w-16 rounded-full ${
                    active ? "bg-sky-100" : ""
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
