"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";
import { Dropdown } from "@/components/Dropdown";
import { Toast } from "@/components/Toast";
import { ArrayInput } from "@/components/ArrayInput";

export default function GraduateTracerStudy() {
  const [currentPage, setCurrentPage] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [civilStatus, setCivilStatus] = useState("Single");
  const [sex, setSex] = useState("");
  const [course, setCourse] = useState("");
  const [yearGraduated, setYearGraduated] = useState("");
  const [college, setCollege] = useState("");
  const [honors, setHonors] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "warning" | "error" | "info"
  >("success");

  const sexOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const courseOptions = [
    { value: "BSCS", label: "BS in Computer Science" },
    { value: "BSIT", label: "BS in Information Technology" },
    { value: "BSMATH", label: "BS in Mathematics" },
  ];

  const collegeOptions = [
    {
      value: "CEC",
      label: "College of Engineering and Computational Sciences",
    },
    { value: "COS", label: "College of Science" },
    { value: "CBM", label: "College of Business and Management" },
  ];

  const civilStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Separated", label: "Separated" },
    { value: "Single Parent", label: "Single Parent" },
    { value: "Widow or Widower", label: "Widow or Widower" },
  ];

  const yearGraduatedOptions = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => ({
      value: String(1900 + i),
      label: String(1900 + i),
    }),
  ).reverse();

  const showToast = (
    message: string,
    type: "success" | "warning" | "error" | "info",
  ) => {
    setToast(message);
    setToastType(type);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!course.trim()) {
      showToast("Course is required", "warning");
      return;
    }
    if (!college.trim()) {
      showToast("College is required", "warning");
      return;
    }
    if (!yearGraduated.trim()) {
      showToast("Year Graduated is required", "warning");
      return;
    }
  };

  const handleNextPage = () => {
    if (!firstName.trim()) {
      showToast("First Name is required", "warning");
      return;
    }
    if (!lastName.trim()) {
      showToast("Last Name is required", "warning");
      return;
    }
    if (!permanentAddress.trim()) {
      showToast("Permanent Address is required", "warning");
      return;
    }
    if (!contactNumber.trim()) {
      showToast("Contact Number is required", "warning");
      return;
    }
    if (!civilStatus.trim()) {
      showToast("Civil Status is required", "warning");
      return;
    }
    if (!sex.trim()) {
      showToast("Sex is required", "warning");
      return;
    }

    setCurrentPage(2);
  };

  const handlePreviousPage = () => {
    setCurrentPage(1);
  };
  const page1Data = [
    { name: "firstName", value: firstName },
    { name: "middleName", value: middleName },
    { name: "lastName", value: lastName },
    { name: "permanentAddress", value: permanentAddress },
    { name: "contactNumber", value: contactNumber },
    { name: "civilStatus", value: civilStatus },
    { name: "sex", value: sex },
  ];

  return (
    <div className="h-fit">
      <div className="flex flex-row gap-2 text-3xl font-bold items-center">
        <Link
          href="/forms"
          className="text-accent/50 hover:text-accent/75 transition-color duration-300 flex flex-row gap-2 items-center"
        >
          <h1>Forms</h1>
          <RiArrowRightSLine size={32} />
        </Link>
        <h1>Graduate Tracer Study </h1>
      </div>
      <p className="text-foreground mb-6">
        {currentPage == 1 ? "General Information" : "Educational Attainment"}
      </p>
      <form
        action="/api/forms/form-a/json"
        onSubmit={handleSubmit}
        className="w-full place-self-center lg:max-w-120 flex flex-col gap-4 mb-8 items-center"
      >
        {currentPage === 1 && (
          <>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="firstName" className="font-semibold text-accent">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="text-foreground placeholder:text-foreground/50 w-full rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
                required
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="middleName" className="font-semibold text-accent">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Enter your middle name"
                className="text-foreground placeholder:text-foreground/50 w-full rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="lastName" className="font-semibold text-accent">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="text-foreground placeholder:text-foreground/50 w-full rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
                required
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="permanentAddress"
                className="font-semibold text-accent"
              >
                Permanent Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="permanentAddress"
                name="permanentAddress"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="Enter your permanent address"
                className="text-foreground placeholder:text-foreground/50 w-full rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
                required
              />
            </div>
            <div className="relative flex flex-col gap-1 w-full">
              <label
                htmlFor="contactNumber"
                className="font-semibold text-accent"
              >
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="XXXXXXXXXXX"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={10}
                className="text-foreground placeholder:text-foreground/50 w-full rounded-2xl p-4 pl-12 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
                required
              />
              <p className="absolute bottom-4.25 left-4 text-foreground/50">
                +63
              </p>
            </div>

            <Dropdown
              id="civilStatus"
              label="Civil Status"
              value={civilStatus}
              onChange={setCivilStatus}
              options={civilStatusOptions}
              required
            />

            <Dropdown
              id="sex"
              label="Sex"
              value={sex}
              onChange={setSex}
              options={sexOptions}
              placeholder="Select your sex"
              required
            />

            <div className="flex gap-4 w-full items-center justify-center mt-4">
              <button
                type="button"
                onClick={handleNextPage}
                className="rounded-2xl py-4 px-8 font-semibold w-fit text-white bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all ease-out duration-300 cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentPage === 2 && (
          <>
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

            <Dropdown
              id="yearGraduated"
              label="Year Graduated"
              value={yearGraduated}
              onChange={setYearGraduated}
              options={yearGraduatedOptions}
              placeholder="Select the year you graduated"
              required
            />

            <ArrayInput
              value={honors}
              onChange={setHonors}
              label="Honors Received"
              fieldName="honors"
            />

            <div className="flex gap-4 w-full items-center justify-center mt-4">
              <button
                type="button"
                onClick={handlePreviousPage}
                className="rounded-2xl py-4 px-8 font-semibold w-fit text-foreground border border-sky-200 hover:bg-sky-50 hover:text-sky-400 active:scale-95 transition-all ease-out duration-300 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-2xl py-4 px-8 font-semibold w-fit text-white bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all ease-out duration-300 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </>
        )}

        {page1Data.map((field) => (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}

        <div className="flex flex-col w-full items-center">
          {toast && (
            <Toast
              message={toast}
              type={toastType}
              setType={setToastType}
              onClose={() => setToast("")}
            />
          )}
        </div>
      </form>
    </div>
  );
}
