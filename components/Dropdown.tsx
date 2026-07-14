import { useState, useRef, useEffect } from "react";
import { LuChevronDown } from "react-icons/lu";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  id: string;
  disabled: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  hasError?: boolean;
}

export function Dropdown({
  id,
  disabled,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  hasError = false,
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

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchend", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchend", handleOutsideClick);
    };
  }, []);

  const handleSummaryClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  if (disabled) {
    return (
      <div className="flex flex-col w-full">
        <p className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          {label}
        </p>
        <div className="list-none flex items-center text-slate-950 justify-between gap-2 overflow-hidden p-4 select-none leading-5 bg-slate-100 border border-sky-200 transition-all duration-300 rounded-2xl">
          <span
            className={`flex-1 text-sm truncate ${
              !value ? "text-slate-950/50" : ""
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col w-full">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2"
        >
          {label}
        </label>

        <details
          ref={detailsRef}
          open={isOpen}
          className={`relative w-full rounded-2xl transition-all duration-300 ${
            isOpen
              ? "bg-sky-100 border-sky-400"
              : hasError
                ? "border-red-500 bg-red-50"
                : "border-sky-200"
          }`}
        >
          <summary
            onClick={handleSummaryClick}
            className="list-none flex items-center justify-between gap-2 overflow-hidden p-4 cursor-pointer select-none text-foreground leading-5 border focus:outline-none focus:ring-2 border-sky-200 focus:ring-sky-100 focus:border-sky-500 transition-all duration-300 rounded-2xl [&::-webkit-details-marker]:hidden"
          >
            <span
              className={`flex-1 min-w-0 truncate ${
                !value ? "text-foreground/50" : ""
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <LuChevronDown
              size={16}
              className={`shrink-0 text-sky-400 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </summary>

          <div
            className="absolute left-0 right-0 mt-2 min-w-full w-fit bg-background border border-sky-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto scrollbar-none"
            style={{ touchAction: "manipulation" }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }
                }}
                className={`${selectedOption && `bg-sky-100 font-semibold`} text-left p-4 hover:bg-sky-100 transition-colors text-foreground cursor-pointer focus:bg-sky-100 focus:outline-none`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </details>

        <input
          id={id}
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
}
