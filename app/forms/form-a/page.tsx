"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";
import { Dropdown } from "@/components/Dropdown";
import { FileInput } from "@/components/FileInput";
import { Toast } from "@/components/Toast";
import { submitForm } from "@/lib/formSubmit";

export default function FormA() {

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [college, setCollege] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState("");

  const courseOptions = [
    { value: "BSCS", label: "BS in Computer Science" },
    { value: "BSIT", label: "BS in Information Technology" },
    { value: "BSMATH", label: "BS in Mathematics" },
  ];

  const collegeOptions = [
    { value: "CEC", label: "College of Engineering and Computational Sciences" },
    { value: "COS", label: "College of Science" },
    { value: "CBM", label: "College of Business and Management" },
  ];

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await submitForm(e.currentTarget, "FormA");
      setToast("Form submitted successfully!");
      setName("");
      setCourse("");
      setCollege("");
      setFile(null);
    } catch (error) {
      setToast("Submission failed.");
    }
  };

  return (
    <div className="h-fit">
      <div className="flex flex-row gap-2 text-3xl font-bold items-center">
        <Link href="/forms" className="text-accent/50 hover:text-accent/75 transition-color duration-300 flex flex-row gap-2 items-center">
          <h1>Forms</h1>
          <RiArrowRightSLine size={32} />          
        </Link>
        <h1>Form A</h1>
      </div>
      <p className="text-foreground mb-6">This is Form A.</p>
    <form action="/api/forms" onSubmit={handleSubmit} className="w-full place-self-center lg:max-w-120 flex flex-col gap-4 mb-8 items-center">
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="name" className="font-semibold text-accent">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="text-foreground placeholder:text-foreground/50 w-full rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
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
      <FileInput
        id="doc"
        label="Upload a document"
        file={file}
        onChange={setFile}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hint="4MB - PDF / DOC / DOCX"
        required
      />
      {toast && <Toast message={toast} type="success" onClose={() => setToast("")} />}
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