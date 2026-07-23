"use client";

import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

export interface InfoAccordionItem {
  id: string;
  title: string;
  content: string;
}

interface InfoAccordionProps {
  items: InfoAccordionItem[];
}

export function InfoAccordion({ items }: InfoAccordionProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItemId === item.id;
        const contentId = `settings-info-${item.id}`;

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => setOpenItemId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-slate-800">{item.title}</span>
              <LuChevronDown
                aria-hidden="true"
                className={`shrink-0 text-sky-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                size={20}
              />
            </button>

            <div
              id={contentId}
              className={`grid transition-[grid-template-rows] duration-200 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="border-t border-slate-100 px-5 py-4 text-sm leading-6 text-slate-600">
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
