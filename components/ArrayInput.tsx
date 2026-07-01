import { LuPlus, LuX } from "react-icons/lu";

interface ArrayInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  label?: string;
  fieldName: string;
  addButtonLabel?: string;
  placeholder?: string;
  required?: boolean;
}

export function ArrayInput({
  value,
  onChange,
  label = "Items",
  fieldName,
  addButtonLabel = "Add Item",
  placeholder,
  required = false,
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
    const updatedItems = value.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="font-semibold text-accent">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2 items-center w-full">
            <input
              type="text"
              name={`${fieldName}-${index}`}
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={placeholder || `${label} ${index + 1}`}
              className="text-foreground placeholder:text-foreground/50 flex-1 rounded-2xl p-4 border border-sky-200 focus:outline-none focus:border-sky-400 bg-transparent transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="p-3 rounded-2xl border border-rose-300 hover:bg-rose-50 text-rose-500 transition-all duration-300 flex items-center justify-center cursor-pointer"
              aria-label={`Remove ${fieldName} ${index + 1}`}
            >
              <LuX size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="flex gap-2 items-center p-4 rounded-2xl border border-dashed border-sky-300 hover:bg-sky-50 text-sky-600 transition-all duration-300 font-semibold cursor-pointer"
        >
          <LuPlus size={18} />
          {addButtonLabel}
        </button>
      </div>
    </div>
  );
}