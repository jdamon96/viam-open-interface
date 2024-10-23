// SearchableMultiSelect.tsx

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
  value: string;
  label: string;
}

interface SearchableMultiSelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (selected: string[]) => void;
  selectedOptionIds: string[]; // Changed from initialSelectedOptionsIds
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  placeholder = "Select options...",
  onChange,
  selectedOptionIds,
}) => {
  const [open, setOpen] = React.useState(false);

  // Derive selected options from selectedOptionIds
  const selectedOptions = React.useMemo(
    () => options.filter((option) => selectedOptionIds.includes(option.value)),
    [options, selectedOptionIds]
  );

  // Handler to add or remove selected values
  const handleSetValue = (val: string) => {
    let newSelected: string[];
    if (selectedOptionIds.includes(val)) {
      newSelected = selectedOptionIds.filter((id) => id !== val);
    } else {
      newSelected = [...selectedOptionIds, val];
    }
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex flex-wrap gap-2 w-full">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="px-2 py-1 rounded-xl bg-slate-200 text-xs font-medium"
                >
                  {option.label}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-full p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search..." className="w-full" />
          <CommandEmpty>No options found.</CommandEmpty>

          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSetValue(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOptionIds.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableMultiSelect;
