// types/program.ts

export interface ProgramOption {
  value: string;
  label: string;
}

export const PROGRAMS: ProgramOption[] = [
  { value: "", label: "Select Program" },

  { value: "bscs", label: "BS in Computer Science" },
  { value: "bsit", label: "BS in Information Technology" },
  { value: "bsmath", label: "BS in Mathematics" },
  { value: "bsce", label: "BS in Civil Engineering" },
  { value: "bsse", label: "BS in Sanitary Engineering" },
];
