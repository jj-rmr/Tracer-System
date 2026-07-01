"use client";

import Link from "next/link";
import { useState } from "react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";


export default function FAQsPage() {
  const [openId, setOpenId] = useState<number | null>(0);

  const questions = [
    {
      id: 0,
      title: "Question 1",
      content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis modi quod dolore nesciunt recusandae corporis, quam, quas architecto ad aspernatur, rerum ex assumenda ab sint vel perferendis explicabo illo dolor?",
    },
    {
      id: 1,
      title: "Question 2",
      content: "This is the answer/details for Question 2. You can expand and collapse this section dynamically.",
    },
    {
      id: 2,
      title: "Question 3",
      content: "This is the answer/details for Question 3. Everything responds smoothly to user clicks.",
    },
  ];

  const toggleDropdown = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <>
      <div className="flex flex-row gap-2 text-3xl font-bold items-center">
        <Link href="/settings" className="text-accent/50 hover:text-accent/75 transition-color duration-300 flex flex-row gap-2 items-center">
          <h1 >Settings </h1>
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
                className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 active:bg-sky-100 transition-all ease-out duration-300"
              >
                <div className="flex flex-row justify-between w-full items-center">
                  <p className="font-semibold">{q.title}</p>
                  <RiArrowDownSLine 
                    size={24} 
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
                }`}>
                  <div className="text-foreground">
                    {q.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </>
  );
}
