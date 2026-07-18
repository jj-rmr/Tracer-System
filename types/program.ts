// types/program.ts

export interface ProgramOption {
  value: string;
  label: string;
}

export const PROGRAMS: ProgramOption[] = [
  { value: "", label: "Select Program" },

  { value: "program_1", label: "Program 1" },
  { value: "program_2", label: "Program 2" },
  { value: "program_3", label: "Program 3" },

  { value: "program_4", label: "Program 4" },
  { value: "program_5", label: "Program 5" },
];
