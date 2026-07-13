"use client";

import { LuPlus, LuTrash2 } from "react-icons/lu";

interface FieldArrayProps {
  label: string;
  values: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
}

export default function FieldArray({
  label,
  values,
  placeholder,
  onChange,
}: FieldArrayProps) {
  function update(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...values, ""]);
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-medium">{label}</label>

        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
        >
          <LuPlus size={16} />
          Add
        </button>
      </div>

      {values.length === 0 && (
        <button
          type="button"
          onClick={add}
          className="w-full rounded-xl border border-dashed p-6 text-slate-400 hover:bg-slate-50"
        >
          Click to add
        </button>
      )}

      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            className="flex-1 rounded-xl border p-3"
            placeholder={placeholder}
            value={value}
            onChange={(e) => update(index, e.target.value)}
          />

          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-xl border border-red-200 px-4 text-red-500 hover:bg-red-50"
          >
            <LuTrash2 />
          </button>
        </div>
      ))}
    </div>
  );
}
