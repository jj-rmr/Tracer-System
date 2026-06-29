"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine, RiArrowDownSLine } from "react-icons/ri";

export default function FormA() {

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [college, setCollege] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, course, college, file });
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
      
      <form onSubmit={handleSubmit} className="w-full  flex flex-col gap-4 mb-8 items-center">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="font-semibold text-foreground">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full min-w-80 rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="course" className="font-semibold text-foreground">Course</label>
          <select
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full min-w-80 rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent cursor-pointer transition-all duration-300"
            required
          >
            <option value="" disabled className="text-gray-400">Select your course</option>
            <option value="computer-science">Computer Science</option>
            <option value="information-technology">Information Technology</option>
            <option value="engineering">Engineering</option>
            <option value="business">Business Administration</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="college" className="font-semibold text-foreground">College</label>
          <select
            id="college"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full min-w-80 rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent cursor-pointer transition-all duration-300"
            required  
          >
            <option value="" disabled className="text-gray-400">Select your college</option>
            <option value="college-of-engineering">College of Engineering</option>
            <option value="college-of-science">College of Science</option>
            <option value="college-of-business">College of Business</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="file" className="font-semibold text-foreground">File</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.value ? e.target.files?.[0] || null : null)}
            className="w-80 rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent cursor-pointer transition-all duration-300"
            required
          />
        </div>
        <button
          type="submit"
          className="w-80 rounded-2xl p-4 font-bold text-white bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all ease-out duration-300 mt-2 cursor-pointer"
        >
          Submit
        </button>
      </form>
    </div>
  );
}