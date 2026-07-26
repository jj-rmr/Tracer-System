import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { LuPlus, LuX } from "react-icons/lu";

interface StringListFieldProps {
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
      ? "cursor-not-allowed border-border bg-secondary text-muted-foreground shadow-none placeholder:text-muted-foreground"
      : err
        ? "border-destructive bg-destructive/10 text-foreground shadow-sm focus:border-destructive focus:bg-card focus:outline-none focus:ring-4 focus:ring-destructive/20"
        : "border-border bg-muted text-foreground shadow-sm focus:border-ring focus:bg-card focus:outline-none focus:ring-4 focus:ring-ring/30";

    return `min-w-0 flex-1 rounded-2xl border px-4 py-3 text-sm transition duration-200 placeholder:text-muted-foreground ${stateClass}`;
  },

  label:
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground",
};

export function StringListField({
  value,
  onChange,
  label = "Items",
  fieldName,
  addButtonLabel = "Add Item",
  placeholder,
  required = false,
  readOnly = false,
  hasError = false,
}: StringListFieldProps) {
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
    <div
      className={`w-full space-y-3 rounded-2xl border p-3 transition duration-200 ${
        readOnly
          ? "border-transparent"
          : hasError
            ? "border-destructive bg-destructive/10"
            : "border-transparent"
      }`}
    >
      <label className={styles.label}>
        {label}
        {required && " *"}
      </label>

      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            disabled={readOnly}
            type="text"
            name={`${fieldName}-${index}`}
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={placeholder ?? `${label} ${index + 1}`}
            className={styles.input(hasError, readOnly)}
          />

          {!readOnly && (
            <Button
              type="button"
              onClick={() => handleRemoveItem(index)}
              variant="destructive"
              size="icon-lg"
              aria-label={`Remove ${fieldName} ${index + 1}`}
            >
              <LuX size={18} />
            </Button>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          type="button"
          onClick={handleAddItem}
          variant="outline"
          size="sm"
        >
          <LuPlus size={16} />
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
}
