"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Survey,
  CivilStatus,
  Sex,
  AdvancedStudyDegree,
  AdvancedStudyReason,
  EmploymentStatus,
  UnemploymentReason,
  CurrentEmploymentStatus,
  BusinessIndustry,
  PlaceOfWork,
  StayingReason,
  AcceptingReason,
  ChangingReason,
  JobDuration,
  JobSource,
  JobLevel,
  MonthlyIncome,
  Competency,
} from "@/types";

interface Props {
  id: string;
}

export default function SurveyDetails({ id }: Props) {
  const router = useRouter();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSurvey() {
      try {
        const res = await fetch(`/api/admin/surveys/${id}`);
        const data = await res.json();

        if (data.success) {
          setSurvey(data.survey);
        }
      } catch (error) {
        console.error("Failed to load survey:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSurvey();
  }, [id]);

  async function save() {
    if (!survey) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/surveys/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(survey),
      });

      const data = await res.json();

      if (data.success) {
        alert("Survey updated.");
        router.refresh();
      } else {
        alert("Update failed.");
      }
    } catch (error) {
      console.error("Error saving survey:", error);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this survey?")) return;

    try {
      const res = await fetch(`/api/admin/surveys/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/surveys");
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  }

  const handleArrayToggle = (field: keyof Survey, value: any) => {
    if (!survey) return;
    const currentArray = (survey[field] as any[]) || [];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    setSurvey({ ...survey, [field]: updatedArray });
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!survey) return <p className="p-6">Survey not found.</p>;

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Survey Profile Administration
        </h1>
        <div className="text-sm text-slate-500">User ID: {survey.userId}</div>
      </div>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="rounded-2xl border p-6 space-y-4 bg-white shadow-sm">
        <h2 className="text-xl font-semibold border-b pb-2 text-slate-800">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Last Name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.lastName || ""}
              onChange={(e) =>
                setSurvey({ ...survey, lastName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              First Name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.firstName || ""}
              onChange={(e) =>
                setSurvey({ ...survey, firstName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Middle Name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.middleName || ""}
              onChange={(e) =>
                setSurvey({ ...survey, middleName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Extension Name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              placeholder="e.g., Jr., III"
              value={survey.extensionName || ""}
              onChange={(e) =>
                setSurvey({ ...survey, extensionName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Sex</label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.sex}
              onChange={(e) =>
                setSurvey({ ...survey, sex: e.target.value as Sex })
              }
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Civil Status
            </label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.civilStatus}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  civilStatus: e.target.value as CivilStatus,
                })
              }
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Separated/Divorced">Separated/Divorced</option>
              <option value="Solo Parent">Solo Parent</option>
              <option value="Widow or Widower">Widow or Widower</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADDRESS & CONTACT */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 space-y-4">
        <h2 className="border-b border-slate-200 pb-2 text-xl font-semibold text-slate-800">
          Address & Contact
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Street</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.street || ""}
              onChange={(e) => setSurvey({ ...survey, street: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Barangay
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.barangay || ""}
              onChange={(e) =>
                setSurvey({ ...survey, barangay: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Municipality / City
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.municipality || ""}
              onChange={(e) =>
                setSurvey({ ...survey, municipality: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Province
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.province || ""}
              onChange={(e) =>
                setSurvey({ ...survey, province: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Region</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.region || ""}
              onChange={(e) => setSurvey({ ...survey, region: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: EDUCATION & GRADUATE STUDIES */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 space-y-4">
        <h2 className="border-b border-slate-200 pb-2 text-xl font-semibold text-slate-800">
          Education Background
        </h2>

        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium text-slate-700">
            Year Graduated
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
            value={survey.yearGraduated ?? ""}
            onChange={(e) =>
              setSurvey({
                ...survey,
                yearGraduated: parseInt(e.target.value, 10),
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Advanced Study Degree
            </label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.advancedStudyDegree}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  advancedStudyDegree: e.target.value as AdvancedStudyDegree,
                })
              }
            >
              <option value="">None / Select Degree</option>
              <option value="MS">MS</option>
              <option value="MA">MA</option>
              <option value="Others">Others</option>
            </select>
          </div>
          {survey.advancedStudyDegree === "Others" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Specify Other Degree
              </label>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                value={survey.advancedStudyOther || ""}
                onChange={(e) =>
                  setSurvey({ ...survey, advancedStudyOther: e.target.value })
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: EMPLOYMENT DETAILS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-5px_rgba(0,0,0,0.04)] shadow-sky-100/80 space-y-4">
        <h2 className="border-b border-slate-200 pb-2 text-xl font-semibold text-slate-800">
          Employment Profile
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Is Currently Employed?
            </label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.employmentStatus}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  employmentStatus: e.target.value as EmploymentStatus,
                })
              }
            >
              <option value="">Select Status</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Never Employed">Never Employed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Current Employment Status Type
            </label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.currentEmploymentStatus}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  currentEmploymentStatus: e.target
                    .value as CurrentEmploymentStatus,
                })
              }
            >
              <option value="">Select Type</option>
              <option value="Regular/Permanent">Regular/Permanent</option>
              <option value="Temporary">Temporary</option>
              <option value="Casual">Casual</option>
              <option value="Contractual">Contractual</option>
              <option value="COS/JO">COS / JO</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Open Contract">Open Contract</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Present Occupation / Job Title
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.currentOccupation || ""}
              onChange={(e) =>
                setSurvey({ ...survey, currentOccupation: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Company Name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.companyName || ""}
              onChange={(e) =>
                setSurvey({ ...survey, companyName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Business Industry Sector
            </label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.businessIndustry}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  businessIndustry: e.target.value as BusinessIndustry,
                })
              }
            >
              <option value="">Select Industry</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Construction">Construction</option>
              <option value="Wholesale/Retail">Wholesale / Retail</option>
              <option value="Food and Beverage">Food and Beverage</option>
              <option value="Financial">Financial</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              {/* Add others if needed matching your type configuration */}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Initial Monthly Income
            </label>
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition duration-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              value={survey.initialMonthlyIncome}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  initialMonthlyIncome: e.target.value as MonthlyIncome,
                })
              }
            >
              <option value="">Select Bracket</option>
              <option value="Below 5000">Below 5000</option>
              <option value="5000-9999">5000-9999</option>
              <option value="10000-14999">10000-14999</option>
              <option value="15000-19999">15000-19999</option>
              <option value="20000-24999">20000-24999</option>
              <option value="25000 Above">25000 Above</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="flex gap-3 justify-end border-t pt-4">
        <button
          onClick={remove}
          className="rounded-xl bg-red-100 px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-200 transition"
        >
          Delete Record
        </button>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50 transition"
        >
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
