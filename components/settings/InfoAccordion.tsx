"use client";

import { Button } from "@/components/ui/button";

import { useState } from "react";
import { LuChevronDown } from "@/components/ui/icons";

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
          <div key={item.id} className={`overflow-hidden rounded-xl`}>
            <Button
              type="button"
              variant="outline"
              size="accordion"
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => setOpenItemId(isOpen ? null : item.id)}
            >
              <span className="min-w-0 font-semibold text-foreground">
                {item.title}
              </span>
              <LuChevronDown
                aria-hidden="true"
                className={`shrink-0 transition-[color,transform] duration-200 ${
                  isOpen
                    ? "rotate-180 text-foreground"
                    : "text-muted-foreground"
                }`}
                size={20}
              />
            </Button>

            <div
              id={contentId}
              className={`grid transition-[grid-template-rows] duration-200 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 py-4 text-sm leading-6 text-muted-foreground">
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
