import { useState, useRef, useEffect } from "react";
import { LuChevronDown } from "react-icons/lu";

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
    const handleOutsideClick = (event: Event) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("touchend", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("touchend", handleOutsideClick);
    };
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
      <label htmlFor={id} className="font-semibold text-accent">
        {label}
      </label>
      <details
        ref={detailsRef}
        open={isOpen || undefined}
        className={`relative w-full rounded-2xl border transition-all duration-300 ${
          isOpen ? "bg-sky-100 border-sky-400" : "border-sky-200"
        }`}
      >
        <summary
          onClick={handleToggle}
          className="list-none flex gap-2 justify-between items-center p-4 cursor-pointer select-none text-foreground leading-5 focus-visible:outline-none focus-visible:ring focus-visible:ring-sky-400 rounded-2xl"
        >
          <span className={!value ? "text-foreground/50" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <LuChevronDown
            size={16}
            className={`text-sky-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </summary>
        <div
          className={`absolute left-0 right-0 mt-2 bg-background border border-sky-200 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-300 ease-in-out max-h-42.25 overflow-y-auto scrollbar-none scrollbar-thumb-sky-200 hover:scrollbar-thumb-sky-400 scrollbar-track-transparent scrollbar-button-none ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{ touchAction: "manipulation" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-full text-left p-4 hover:bg-sky-50 transition-colors text-foreground cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </details>
      <input
        type="text"
        name={id}
        className="sr-only"
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
