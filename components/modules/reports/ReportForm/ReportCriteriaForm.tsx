import React, { useMemo } from "react";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSpecies } from "@/store/useSpecies";
import { useDistrictStore } from "@/store/useDistricts";
import { Info } from "lucide-react";

const SUBMISSION_TYPES = [
  { value: "reportings", label: "Reportings" },
  { value: "sightings", label: "Sightings" },
];

interface ReportCriteriaFormProps {
  formik: any;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  isPending?: boolean;
}

export function ReportCriteriaForm({
  formik,
  onDateRangeChange,
  isPending = false,
}: ReportCriteriaFormProps) {
  const { species } = useSpecies();
  const { districts } = useDistrictStore();

  const speciesOptions = useMemo(() => {
    return species.map((s) => ({ label: s.label.en, value: s.value }));
  }, [species]);

  return (
    <div className="px-6 py-4 flex-1 overflow-y-auto">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Filters default to <span className="font-medium">All</span>. The
            report is generated across every option unless you pick specific
            ones.
          </span>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Submission Type</Label>
          <Select
            value={formik.values.submissionType}
            onValueChange={(value) =>
              formik.setFieldValue("submissionType", value)
            }
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select submission type" />
            </SelectTrigger>
            <SelectContent>
              {SUBMISSION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">
            Date Range<span className="text-red-500 ml-[-4px]">*</span>
          </Label>
          <DateRangePicker
            date={formik.values.dateRange}
            onDateChange={onDateRangeChange}
            placeholder="Select date range"
            numberOfMonths={2}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Districts</Label>
          <MultiSelect
            options={districts}
            selected={formik.values.districts}
            onChange={(values) => formik.setFieldValue("districts", values)}
            placeholder="Select districts..."
            maxDisplay={3}
            disabled={isPending}
            enableSelectAll
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700">Species</Label>
          <MultiSelect
            options={speciesOptions}
            selected={formik.values.species}
            onChange={(values) => formik.setFieldValue("species", values)}
            placeholder="Select species..."
            maxDisplay={3}
            disabled={isPending}
            enableSelectAll
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-700">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the purpose of this report, e.g., 'Monthly marine wildlife monitoring report for conservation analysis' or 'Research data compilation for species migration patterns study'"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={3}
            className="resize-none"
            disabled={isPending}
          />
        </div>
      </form>
    </div>
  );
}
