"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  name = id,
  description,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  hasError = false,
  errorMessage,
}: SelectFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const listboxId = `${id}-listbox`;
  const isInvalid = hasError || Boolean(errorMessage);
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  useEffect(() => {
    function handleOutsideInteraction(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, []);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  function findEnabledOption(startIndex: number, direction: 1 | -1) {
    if (options.length === 0) return -1;

    for (let offset = 0; offset < options.length; offset += 1) {
      const index =
        (startIndex + direction * offset + options.length) % options.length;
      if (!options[index].disabled) return index;
    }

    return -1;
  }

  function openDropdown(preferredIndex = selectedIndex) {
    const startIndex = preferredIndex >= 0 ? preferredIndex : 0;
    setActiveIndex(findEnabledOption(startIndex, 1));
    setIsOpen(true);
  }

  function closeDropdown() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;

    onChange(option.value);
    closeDropdown();
    triggerRef.current?.focus();
  }

  function moveActiveOption(direction: 1 | -1) {
    const fallback = direction === 1 ? 0 : options.length - 1;
    const nextStart = activeIndex >= 0 ? activeIndex + direction : fallback;
    setActiveIndex(findEnabledOption(nextStart, direction));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (isOpen) moveActiveOption(1);
        else openDropdown();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) moveActiveOption(-1);
        else openDropdown(selectedIndex >= 0 ? selectedIndex : options.length - 1);
        break;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(findEnabledOption(0, 1));
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(findEnabledOption(options.length - 1, -1));
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && activeIndex >= 0) selectOption(activeIndex);
        else openDropdown();
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          closeDropdown();
        }
        break;
      case "Tab":
        closeDropdown();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative flex w-full flex-col">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
      </label>

      {description && (
        <p id={descriptionId} className="mb-2 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-describedby={describedBy}
        aria-expanded={isOpen && !disabled}
        aria-haspopup="listbox"
        aria-invalid={isInvalid}
        aria-required={required}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => {
          if (isOpen) closeDropdown();
          else openDropdown();
        }}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-left text-sm transition duration-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none ${
          isInvalid
            ? "border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
            : "border-slate-200 shadow-sm hover:border-slate-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        }`}
      >
        <span className={`truncate ${selectedOption ? "text-slate-900" : "text-slate-400"}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <LuChevronDown
          aria-hidden="true"
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen && !disabled ? "rotate-180 text-sky-500" : ""
          }`}
        />
      </button>

      <input type="hidden" name={name} value={value} />

      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="scrollbar-none absolute left-0 right-0 top-full z-50 mt-2 max-h-60 space-y-0.5 overflow-y-auto rounded-2xl border border-sky-100 bg-white p-1.5 shadow-xl shadow-sky-100/50"
        >
          {options.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">No options available</p>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <button
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  id={`${id}-option-${index}`}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => selectOption(index)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:text-slate-300 ${
                    isSelected
                      ? "bg-sky-100 font-semibold text-sky-700"
                      : isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <LuCheck aria-hidden="true" size={16} className="shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}

      {errorMessage && (
        <p id={errorId} role="alert" className="mt-2 text-xs font-medium text-rose-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
