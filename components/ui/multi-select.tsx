"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const ALL_OPTION_VALUE = "__ALL__";

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
  enableSelectAll?: boolean;
  allOptionLabel?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false,
  maxDisplay = 3,
  enableSelectAll = false,
  allOptionLabel = "All",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const allOptions = enableSelectAll
    ? [{ label: allOptionLabel, value: ALL_OPTION_VALUE }, ...options]
    : options;

  const handleUnselect = (value: string) => {
    const next = selected.filter((item) => item !== value);
    onChange(enableSelectAll && next.length === 0 ? [ALL_OPTION_VALUE] : next);
  };

  const handleSelect = (value: string) => {
    if (enableSelectAll && value === ALL_OPTION_VALUE) {
      onChange([ALL_OPTION_VALUE]);
      return;
    }

    if (selected.includes(value)) {
      handleUnselect(value);
    } else {
      const withoutAll = selected.filter((item) => item !== ALL_OPTION_VALUE);
      const next = [...withoutAll, value];
      onChange(
        enableSelectAll && next.length === options.length
          ? [ALL_OPTION_VALUE]
          : next,
      );
    }
  };

  const selectedOptions = allOptions.filter((option) =>
    selected.includes(option.value),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal h-auto min-h-[2rem] py-2",
            !selected.length && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex items-center flex-wrap gap-1 flex-1 overflow-hidden">
            {selected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedOptions.slice(0, maxDisplay).map((option) => (
              <Badge
                variant="secondary"
                key={option.value}
                className="flex items-center gap-1 text-xs px-2 py-1 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(option.value);
                }}
              >
                {option.icon && <option.icon className="h-3 w-3" />}
                <span className="truncate max-w-[100px]">{option.label}</span>
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
              </Badge>
            ))}
            {selected.length > maxDisplay && (
              <Badge variant="secondary" className="text-xs px-2 py-1 h-6">
                +{selected.length - maxDisplay} more
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {allOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
