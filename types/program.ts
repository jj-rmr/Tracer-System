// types/program.ts

export interface ProgramOption {
  value: string;
  label: string;
}

export const PROGRAMS: ProgramOption[] = [
  // Goa Campus - College of Education
  { value: "beed", label: "Bachelor of Elementary Education (BEED)" },
  {
    value: "bsed-eng",
    label: "Bachelor of Secondary Education major in English (BSEd English)",
  },
  {
    value: "bsed-fil",
    label: "Bachelor of Secondary Education major in Filipino (BSEd Filipino)",
  },
  {
    value: "bsed-math",
    label:
      "Bachelor of Secondary Education major in Mathematics (BSEd Mathematics)",
  },
  {
    value: "bsed-sci",
    label: "Bachelor of Secondary Education major in Science (BSEd Science)",
  },
  {
    value: "bsed-soc",
    label:
      "Bachelor of Secondary Education major in Social Studies (BSEd SocStud)",
  },
  {
    value: "bsed-val",
    label:
      "Bachelor of Secondary Education major in Values Education (BSEd VE)",
  },

  // Goa Campus - College of Business and Management
  { value: "bsa", label: "BS in Accountancy (BSA)" },
  {
    value: "bsba-fm",
    label:
      "BS in Business Administration major in Financial Management (BSBA-FM)",
  },
  { value: "bsecon", label: "BS in Economics (BSEcon)" },
  { value: "bsentrep", label: "BS in Entrepreneurship (BSEntrep)" },
  { value: "bsoa", label: "BS in Office Administration (BSOA)" },

  // Goa Campus - College of Engineering and Computational Sciences
  { value: "bsce", label: "BS in Civil Engineering (BSCE)" },
  { value: "bsse", label: "BS in Sanitary Engineering (BSSE)" },
  { value: "bscs", label: "BS in Computer Science (BSCS)" },
  { value: "bsit", label: "BS in Information Technology (BSIT)" },
  { value: "bsmath", label: "BS in Mathematics (BSMath)" },
  {
    value: "bet-met-auto",
    label:
      "Bachelor of Engineering Technology in Mechanical Engineering Technology major in Automotive Technology (BET-MET-AUTO)",
  },
  {
    value: "bet-met-rac",
    label:
      "Bachelor of Engineering Technology in Mechanical Engineering Technology major in Refrigeration and Airconditioning Technology (BET-MET-RAC)",
  },
  {
    value: "bet-eet",
    label:
      "Bachelor of Engineering Technology in Electrical Engineering Technology (BET-EET)",
  },

  // Goa Campus - College of Arts and Humanities
  { value: "bacom", label: "Bachelor of Arts in Communication (BACom)" },
  { value: "bpa", label: "Bachelor of Public Administration (BPA)" },

  // Goa Campus - College of Science
  { value: "bsgeol", label: "BS in Geology (BSGeo)" },
  { value: "bsbio", label: "BS in Biology (BSBio)" },

  // Caramoan Campus
  {
    value: "bsbio-cre",
    label:
      "BS in Biology major in Conservation and Restoration Ecology (BSBio-CRE)",
  },
  {
    value: "bstm-eco",
    label: "BS in Tourism Management major in Ecotourism (BSTM-Eco)",
  },

  // Lagonoy Campus
  { value: "bsnd", label: "BS in Nutrition and Dietetics (BSND)" },
  { value: "bscrim", label: "BS in Criminology (BSCrim)" },
  { value: "bsism", label: "BS in Industrial Security Management (BSISM)" },

  // Sagñay Campus
  { value: "bsfish", label: "BS in Fisheries" },
  { value: "bsmb", label: "BS in Marine Biology (BSMB)" },

  // Salogon Campus
  { value: "bsab", label: "BS in Agribusiness (BSAB)" },
  { value: "bscd", label: "BS in Community Development (BSCD)" },

  // San Jose Campus
  { value: "bshm", label: "BS in Hospitality Management (BSHM)" },
  { value: "bstm", label: "BS in Tourism Management (BSTM)" },

  // Tinambac Campus
  { value: "bses", label: "BS in Environmental Science (BSES)" },
  { value: "bsep", label: "BS in Environmental Planning (BSEP)" },
  { value: "bsf", label: "BS in Forestry (BSF)" },
];

export interface ProgramFolderInfo {
  campus: string;
  college: string;
}

export const PROGRAM_FOLDER_MAP: Record<string, ProgramFolderInfo> = {
  // Goa Campus - College of Education
  beed: {
    campus: "Goa Campus",
    college: "College of Education",
  },
  "bsed-eng": {
    campus: "Goa Campus",
    college: "College of Education",
  },
  "bsed-fil": {
    campus: "Goa Campus",
    college: "College of Education",
  },
  "bsed-math": {
    campus: "Goa Campus",
    college: "College of Education",
  },
  "bsed-sci": {
    campus: "Goa Campus",
    college: "College of Education",
  },
  "bsed-soc": {
    campus: "Goa Campus",
    college: "College of Education",
  },
  "bsed-val": {
    campus: "Goa Campus",
    college: "College of Education",
  },

  // Goa Campus - College of Business and Management
  bsa: {
    campus: "Goa Campus",
    college: "College of Business and Management",
  },
  "bsba-fm": {
    campus: "Goa Campus",
    college: "College of Business and Management",
  },
  bsecon: {
    campus: "Goa Campus",
    college: "College of Business and Management",
  },
  bsentrep: {
    campus: "Goa Campus",
    college: "College of Business and Management",
  },
  bsoa: {
    campus: "Goa Campus",
    college: "College of Business and Management",
  },

  // Goa Campus - College of Engineering and Computational Sciences
  bsce: {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  bsse: {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  bscs: {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  bsit: {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  bsmath: {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  "bet-met-auto": {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  "bet-met-rac": {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },
  "bet-eet": {
    campus: "Goa Campus",
    college: "College of Engineering and Computational Sciences",
  },

  // Goa Campus - College of Arts and Humanities
  bacom: {
    campus: "Goa Campus",
    college: "College of Arts and Humanities",
  },
  bpa: {
    campus: "Goa Campus",
    college: "College of Arts and Humanities",
  },

  // Goa Campus - College of Science
  bsgeol: {
    campus: "Goa Campus",
    college: "College of Science",
  },
  bsbio: {
    campus: "Goa Campus",
    college: "College of Science",
  },

  // Caramoan Campus
  "bsbio-cre": {
    campus: "Caramoan Campus",
    college: "College of Science",
  },
  "bstm-eco": {
    campus: "Caramoan Campus",
    college: "College of Tourism and Hospitality Management",
  },

  // Lagonoy Campus
  bsnd: {
    campus: "Lagonoy Campus",
    college: "College of Health Sciences",
  },
  bscrim: {
    campus: "Lagonoy Campus",
    college: "College of Criminal Justice Education",
  },
  bsism: {
    campus: "Lagonoy Campus",
    college: "College of Criminal Justice Education",
  },

  // Sagñay Campus
  bsfish: {
    campus: "Sagñay Campus",
    college: "College of Fisheries",
  },
  bsmb: {
    campus: "Sagñay Campus",
    college: "College of Fisheries",
  },

  // Salogon Campus
  bsab: {
    campus: "Salogon Campus",
    college: "College of Agriculture",
  },
  bscd: {
    campus: "Salogon Campus",
    college: "College of Social Sciences",
  },

  // San Jose Campus
  bshm: {
    campus: "San Jose Campus",
    college: "College of Tourism and Hospitality Management",
  },
  bstm: {
    campus: "San Jose Campus",
    college: "College of Tourism and Hospitality Management",
  },

  // Tinambac Campus
  bses: {
    campus: "Tinambac Campus",
    college: "College of Environmental Sciences",
  },
  bsep: {
    campus: "Tinambac Campus",
    college: "College of Environmental Sciences",
  },
  bsf: {
    campus: "Tinambac Campus",
    college: "College of Environmental Sciences",
  },
};
