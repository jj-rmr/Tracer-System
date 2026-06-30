"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";
import { Dropdown } from "@/components/Dropdown";

export default function FormA() {

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [college, setCollege] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const courseOptions = [
    { value: "CS", label: "Computer Science" },
    { value: "IT", label: "Information Technology" },
    { value: "DS", label: "Data Science" },
  ];

  const collegeOptions = [
    { value: "CEC", label: "College of Engineering and Computational Sciences" },
    { value: "COS", label: "College of Science" },
    { value: "CBM", label: "College of Business" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-screen">
      <div className="flex flex-row gap-2 text-3xl font-bold items-center">
        <Link href="/forms" className="text-accent/50 hover:text-accent/75 transition-color duration-300 flex flex-row gap-2 items-center">
          <h1>Forms</h1>
          <RiArrowRightSLine size={32} />          
        </Link>
        <h1>Form A</h1>
      </div>
      <p className="text-foreground mb-6">This is Form A.</p>
      
    <form onSubmit={handleSubmit} className="w-full place-self-center lg:max-w-120 flex flex-col gap-4 mb-8 items-center">
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="name" className="font-semibold text-foreground">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
          required
        />
      </div>

      <Dropdown
        id="course"
        label="Course"
        value={course}
        onChange={setCourse}
        options={courseOptions}
        placeholder="Select your course"
        required
      />

      <Dropdown
        id="college"
        label="College"
        value={college}
        onChange={setCollege}
        options={collegeOptions}
        placeholder="Select your college"
        required
      />

      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="file" className="font-semibold text-foreground">File</label>
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.value ? e.target.files?.[0] || null : null)}
          className="rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent cursor-pointer transition-all duration-300"
          required
        />
      </div>

      <button
        type="submit"
        className="rounded-2xl py-4 px-8 font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all ease-out duration-300 mt-2 cursor-pointer"
      >
        Submit
      </button>
    </form>
    </div>
  );
}