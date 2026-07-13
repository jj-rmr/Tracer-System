"use client";

import Link from "next/link";
import { useState } from "react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

export default function FAQsPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const questions = [
    {
      id: 0,
      title: "What is the purpose of this Graduate Tracer Study?",
      content:
        "This system collects employment data and institutional feedback from our alumni. Your responses help the university evaluate curriculum relevance, maintain academic accreditation, and improve career services for future students.",
    },
    {
      id: 1,
      title: "How long does it take to complete the survey?",
      content:
        "The survey typically takes about 5 to 10 minutes to complete. Your progress is automatically saved, so you can exit and return to finish it later if needed.",
    },
    {
      id: 2,
      title: "Is my personal and employment data safe?",
      content:
        "Yes, absolutely. All submitted data is heavily encrypted and strictly protected under data privacy laws. Results are aggregated for statistical reporting, meaning your individual personal identity and specific salary data will never be publicly disclosed.",
    },
    {
      id: 3,
      title: "Can I update my responses if my employment status changes?",
      content:
        "Yes. You can log back into your tracer account at any time to update your profile, current job title, employer details, and contact information to keep your records current.",
    },
    {
      id: 4,
      title: "What should I do if I forgot my login credentials?",
      content:
        "Click the 'Forgot Password' link on the login page and enter your registered institutional or personal email. A secure password reset link will be sent to you immediately. If you no longer have access to that email, please contact the Alumni Affairs Office.",
    },
    {
      id: 5,
      title: "Who do I contact if I encounter a technical issue or bug?",
      content:
        "If you experience any system glitches, broken pages, or errors while submitting, please take a screenshot and email our technical support team at support@university-tracer.edu or use the 'Report a Problem' form in your dashboard.",
    },
  ];

  const toggleDropdown = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      <div className="flex flex-row gap-2 text-3xl font-bold items-center">
        <Link
          href="/settings"
          className="text-accent/50 hover:text-accent/75 transition-color duration-300 flex flex-row gap-2 items-center"
        >
          <h1>Settings </h1>
          <RiArrowRightSLine size={32} />
        </Link>
        <h1>FAQs</h1>
      </div>
      <p className="text-foreground">This is the FAQs page.</p>
      <div className="flex flex-col gap-2 mt-8 md:mt-12 items-center">
        {questions.map((q) => {
          const isOpen = openId === q.id;

          return (
            <div
              key={q.id}
              onClick={() => toggleDropdown(q.id)}
              className="w-full lg:max-w-2xl h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 active:bg-sky-100 transition-all ease-out duration-300"
            >
              <div className="flex flex-row justify-between w-full items-center">
                <p className="font-semibold">{q.title}</p>
                <RiArrowDownSLine
                  size={24}
                  className={`transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-foreground text-sm">{q.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
