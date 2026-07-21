import { LuPlus, LuX } from "react-icons/lu";

interface ArrayInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  label?: string;
  fieldName: string;
  addButtonLabel?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
}

const styles = {
  input: (err: boolean, disabled: boolean) => {
    const stateClass = disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 shadow-none placeholder:text-slate-400"
      : "focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 shadow-sm text-slate-900";

    return `w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition duration-200 placeholder:text-slate-400 ${stateClass} ${
      err && !disabled ? "border-rose-400 focus:ring-rose-100" : ""
    }`;
  },

  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600",

  removeButton:
    "rounded-xl border border-rose-200 p-3 text-rose-500 shadow-sm transition duration-200 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100",

  addButton:
    "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-sky-600 shadow-sm transition duration-200 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100",
};

export function ArrayInput({
  value,
  onChange,
  label = "Items",
  fieldName,
  addButtonLabel = "Add Item",
  placeholder,
  required = false,
  readOnly = false,
  hasError = false,
}: ArrayInputProps) {
  const handleAddItem = () => {
    onChange([...value, ""]);
  };

  const handleItemChange = (index: number, newValue: string) => {
    const updatedItems = [...value];
    updatedItems[index] = newValue;
    onChange(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-3">
      <label className={styles.label}>
        {label}
        {required && " *"}
      </label>

      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            disabled={readOnly}
            type="text"
            name={`${fieldName}-${index}`}
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={placeholder ?? `${label} ${index + 1}`}
            className={styles.input(hasError, readOnly)}
          />

          {!readOnly && (
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className={styles.removeButton}
              aria-label={`Remove ${fieldName} ${index + 1}`}
            >
              <LuX size={18} />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          onClick={handleAddItem}
          className={styles.addButton}
        >
          <LuPlus size={16} />
          {addButtonLabel}
        </button>
      )}
    </div>
  );
}
