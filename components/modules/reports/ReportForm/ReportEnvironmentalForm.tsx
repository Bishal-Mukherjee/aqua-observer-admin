import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { MultiSelect, ALL_OPTION_VALUE } from "@/components/ui/multi-select";
import { useStaticLookup } from "@/store/useStaticLookup";
import { Info } from "lucide-react";

interface ReportEnvironmentalFormProps {
  formik: any;
}

export function ReportEnvironmentalForm({
  formik,
}: ReportEnvironmentalFormProps) {
  const {
    disturbances,
    fishingGears,
    waterBodies,
    waterBodyConditions,
    weatherConditions,
  } = useStaticLookup();

  const noDisturbanceOption = useMemo(
    () =>
      disturbances?.find(
        (d) => d.label?.trim().toLowerCase() === "no disturbances",
      ),
    [disturbances],
  );

  const showFishingGears = formik.values.threats?.includes("FISHING_ACTIVITY");

  const handleThreatsChange = (values: string[]) => {
    const prevThreats: string[] = formik.values.threats || [];
    const noDisturbanceValue = noDisturbanceOption?.value;

    if (!noDisturbanceValue) {
      formik.setFieldValue("threats", values);
      return;
    }

    const noDisturbanceJustSelected =
      values.includes(noDisturbanceValue) &&
      !prevThreats.includes(noDisturbanceValue);

    if (noDisturbanceJustSelected) {
      // Selecting "No Disturbances" clears every other threat.
      formik.setFieldValue("threats", [noDisturbanceValue]);
      return;
    }

    if (values.includes(noDisturbanceValue) && values.length > 1) {
      // Selecting another threat while "No Disturbances" is active drops it.
      formik.setFieldValue(
        "threats",
        values.filter((v) => v !== noDisturbanceValue),
      );
      return;
    }

    formik.setFieldValue("threats", values);
  };

  return (
    <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-240px)]">
      <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Filters default to <span className="font-medium">All</span>. The
          report is generated across every option unless you pick specific ones.
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="waterBody">Water Body</Label>
        <MultiSelect
          options={waterBodies}
          selected={formik.values.waterBody || []}
          onChange={(value) => formik.setFieldValue("waterBody", value)}
          placeholder="Select water body type"
          maxDisplay={3}
          className="w-full"
          enableSelectAll
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="waterBodyConditions">Water Body Conditions</Label>
        <MultiSelect
          options={waterBodyConditions}
          selected={formik.values.waterBodyConditions || []}
          onChange={(value) =>
            formik.setFieldValue("waterBodyConditions", value)
          }
          placeholder="Select water body conditions"
          maxDisplay={3}
          className="w-full"
          enableSelectAll
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weatherConditions">Weather Conditions</Label>
        <MultiSelect
          options={weatherConditions}
          selected={formik.values.weatherConditions || []}
          onChange={(value) => formik.setFieldValue("weatherConditions", value)}
          placeholder="Select weather conditions"
          maxDisplay={3}
          className="w-full"
          enableSelectAll
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="threats">Threats</Label>
        <MultiSelect
          options={disturbances}
          selected={formik.values.threats || []}
          onChange={handleThreatsChange}
          placeholder="Select threats"
          maxDisplay={3}
          className="w-full"
          enableSelectAll
        />
      </div>

      {showFishingGears && (
        <div className="space-y-2">
          <Label htmlFor="fishingGears">Fishing Gears</Label>
          <MultiSelect
            options={fishingGears}
            selected={formik.values.fishingGears || []}
            onChange={(value) => formik.setFieldValue("fishingGears", value)}
            placeholder="Select fishing gears"
            maxDisplay={3}
            className="w-full"
            enableSelectAll
          />
        </div>
      )}
    </div>
  );
}
