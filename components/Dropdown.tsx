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
  description?: string;
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
  description,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  hasError = false,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative flex w-full flex-col">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
      </label>

      {description && (
        <p className="mb-2 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}

      {disabled ? (
        <div className="flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 shadow-none">
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>

          <LuChevronDown size={18} className="shrink-0 text-slate-400" />
        </div>
      ) : (
        <>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className={`
              flex w-full items-center justify-between gap-3
              rounded-2xl border bg-slate-50 px-4 py-3
              text-left text-sm text-slate-900
              transition duration-200
              focus:outline-none
              ${
                hasError
                  ? "border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  : "border-slate-200 shadow-sm focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              }
            `}
          >
            <span
              className={`truncate ${
                value ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {selectedOption?.label ?? placeholder}
            </span>

            <LuChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-sky-500" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div
              role="listbox"
              className="
                absolute left-0 right-0 top-full z-50 mt-2
                max-h-60 overflow-y-auto
                space-y-0.5 rounded-2xl border border-sky-100
                bg-white p-1.5
                shadow-xl shadow-sky-100/50
                scrollbar-none
              "
            >
              <div
                className={`
                    w-full px-4 py-3
                    text-left text-sm
                    text-slate-300 cursor-default
                  `}
              >
                {placeholder}
              </div>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full rounded-xl px-4 py-3
                    text-left text-sm
                    transition-colors duration-150
                    ${
                      option.value === value
                        ? "bg-sky-200 font-semibold text-sky-700"
                        : "text-slate-700 hover:bg-sky-100"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <input
            id={id}
            name={id}
            type="text"
            value={value}
            required={required}
            readOnly
            tabIndex={-1}
            className="sr-only"
          />
        </>
      )}
    </div>
  );
}
