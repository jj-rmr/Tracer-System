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
  input: (err: boolean, disabled: boolean) =>
    `w-full p-4 rounded-2xl border text-slate-950 text-sm transition duration-300 focus:outline-none focus:ring-2 ${
      err
        ? "border-rose-400 focus:ring-rose-100"
        : disabled
          ? "bg-slate-200 border-none"
          : "bg-white border-sky-200 focus:ring-sky-100 focus:border-sky-500"
    }`,

  label:
    "block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2",

  removeButton:
    "p-3 rounded-xl border border-rose-300 text-rose-500 transition duration-300 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400",

  addButton:
    "inline-flex items-center gap-2 py-2 px-3 text-xs font-semibold text-sky-600 rounded-lg transition duration-300 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200 border border-transparent focus:border-sky-400",
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
