"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  numberOfMonths?: number;
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = "Pick a date range",
  className,
  disabled = false,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [freshlyOpened, setFreshlyOpened] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(date);

  React.useEffect(() => {
    if (!isOpen) setDraft(date);
  }, [date, isOpen]);

  const normalizeRange = (r: DateRange): DateRange => {
    const { from, to } = r;
    return from && to && from > to ? { from: to, to: from } : r;
  };

  const isComplete = (r: DateRange | undefined) => Boolean(r?.from && r?.to);

  const setAndNotify = (r: DateRange | undefined) => {
    setDraft(r);
    onDateChange?.(r);
  };

  const formatDateRange = (r: DateRange | undefined): string => {
    if (!r?.from && !r?.to) return placeholder;
    if (r?.from && r?.to)
      return `${dayjs(r.from).format("MMM D, YYYY")} - ${dayjs(r.to).format(
        "MMM D, YYYY"
      )}`;
    if (r?.from) return dayjs(r.from).format("MMM D, YYYY");
    if (r?.to) return dayjs(r.to).format("MMM D, YYYY");
    return placeholder;
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setFreshlyOpened(true);
      setDraft(date);
    }
  };

  const closeIfComplete = (r: DateRange | undefined) => {
    if (isComplete(r)) setIsOpen(false);
  };

  const handleDayClick = (day: Date) => {
    // Case A: First click after opening with an existing complete range
    if (freshlyOpened && date?.from && date?.to) {
      setFreshlyOpened(false);
      const next: DateRange = { from: undefined, to: day };
      setAndNotify(next);
      return; // keep popover open
    }

    // Case B: Picking "from" after picking "to" first
    if (!draft?.from && draft?.to) {
      const next = normalizeRange({ from: day, to: draft.to });
      setAndNotify(next);
      closeIfComplete(next);
      return;
    }

    // Case C: Have "from", now picking "to"
    if (draft?.from && !draft.to) {
      const next = normalizeRange({ from: draft.from, to: day });
      setAndNotify(next);
      closeIfComplete(next);
      return;
    }

    // Case D: No draft yet (start with "from")
    if (!draft?.from && !draft?.to) {
      const next: DateRange = { from: day, to: undefined };
      setAndNotify(next);
      return; // keep popover open for "to"
    }

    // Fallback: both set but not freshly opened -> start a new selection with "from"
    const next: DateRange = { from: day, to: undefined };
    setAndNotify(next);
  };

  const defaultMonth = draft?.from ?? draft?.to ?? date?.from ?? date?.to;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date-range"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 mr-2" align="start">
          <Calendar
            mode="range"
            selected={draft}
            defaultMonth={defaultMonth}
            numberOfMonths={numberOfMonths}
            disabled={disabled}
            showOutsideDays={false}
            onDayClick={handleDayClick}
          />

          <div className="pl-4 pb-2">
            <Button
              size="sm"
              onClick={() => {
                onDateChange?.(undefined);
                setAndNotify(undefined);
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type { DateRangePickerProps };
