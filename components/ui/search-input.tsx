import * as React from "react";
import { LuSearch } from "react-icons/lu";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function SearchInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  return (
    <div className="relative flex-1">
      <LuSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input type="search" className={cn("pl-9", className)} {...props} />
    </div>
  );
}

export { SearchInput };
