import { useState, useRef, useEffect } from "react";
import { LuArrowDown, LuChevronDown } from "react-icons/lu";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

export function Dropdown({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
}: DropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="font-semibold text-foreground">
        {label}
      </label>
      <details
        ref={detailsRef}
        open={isOpen || undefined}
        className={`relative w-full rounded-2xl border transition-all duration-300 ${
          isOpen ? "bg-sky-50/5 border-sky-400" : "border-sky-200"
        }`}
      >
        <summary
          onClick={handleToggle}
          className="list-none flex gap-2 justify-between items-center p-4 cursor-pointer outline-none select-none text-foreground leading-5"
        >
          <span className={!value ? "text-foreground/40" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <LuChevronDown className={`text-sky-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}/>
        </summary>

        <div
          className={`absolute left-0 right-0 mt-2 bg-background border border-sky-200 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left p-4 hover:bg-sky-50 transition-colors text-foreground"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </details>
      {required && <input type="text" className="sr-only" value={value} required readOnly />}
    </div>
  );
}

export default function CollegeForm() {
  const [college, setCollege] = useState("");

  const collegeOptions = [
    { value: "CEC", label: "College of Engineering and Computational Sciences" },
    { value: "COS", label: "College of Science" },
    { value: "CBM", label: "College of Business" },
  ];

  return (
    <Dropdown
      id="college"
      label="College"
      value={college}
      onChange={setCollege}
      options={collegeOptions}
      placeholder="Select your college"
      required
    />
  );
}