import { NextResponse } from "next/server";
import { formatTimestamp, sanitizeForFilename } from "@/lib/upload";

export async function POST(req: Request) {
  const formData = await req.formData();

  // Get all form values
  const firstName = formData.get("firstName")?.toString() || "";
  const middleName = formData.get("middleName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";
  const permanentAddress = formData.get("permanentAddress")?.toString() || "";
  const contactNumber = formData.get("contactNumber")?.toString() || "";
  const civilStatus = formData.get("civilStatus")?.toString() || "";
  const sex = formData.get("sex")?.toString() || "";
  const course = formData.get("course")?.toString() || "";
  const college = formData.get("college")?.toString() || "";
  const yearGraduated = formData.get("yearGraduated")?.toString() || "";

  // Get honors array
  const honorsArray: string[] = [];
  let i = 0;
  while (true) {
    const honor = formData.get(`honors-${i}`);
    if (honor === null) break;
    const honorStr = honor.toString().trim();
    if (honorStr) {
      honorsArray.push(honorStr);
    }
    i++;
  }

  // Map values to display labels (using options from form)
  const civilStatusMap: Record<string, string> = {
    Single: "Single",
    Married: "Married",
    Separated: "Separated",
    "Single Parent": "Single Parent",
    "Widow or Widower": "Widow or Widower",
  };

  const sexMap: Record<string, string> = {
    Male: "Male",
    Female: "Female",
  };

  const courseMap: Record<string, string> = {
    BSCS: "BS in Computer Science",
    BSIT: "BS in Information Technology",
    BSMATH: "BS in Mathematics",
  };

  const collegeMap: Record<string, string> = {
    CEC: "College of Engineering and Computational Sciences",
    COS: "College of Science",
    CBM: "College of Business and Management",
  };

  // Build JSON with labels and values
  const formDataJson = {
    timestamp: formatTimestamp(),
    personalInformation: {
      "First Name": firstName,
      "Middle Name": middleName,
      "Last Name": lastName,
      "Permanent Address": permanentAddress,
      "Contact Number": `+63${contactNumber}`,
    },
    academicInformation: {
      "Civil Status": civilStatusMap[civilStatus] || civilStatus,
      Sex: sexMap[sex] || sex,
      Course: courseMap[course] || course,
      College: collegeMap[college] || college,
      "Year Graduated": yearGraduated,
    },
    honors: honorsArray.length > 0 ? honorsArray : [],
  };

  // Generate filename
  const safeName = sanitizeForFilename(`${firstName}_${lastName}` || "unknown");
  const timestamp = formatTimestamp();
  const filename = `FormA_${safeName}_${timestamp}.json`;

  // Return JSON file as download
  return new Response(JSON.stringify(formDataJson, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
