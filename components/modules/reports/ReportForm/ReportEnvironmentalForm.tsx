import React from "react";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useStaticLookup } from "@/store/useStaticLookup";

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

  const showFishingGears = formik.values.threats?.includes("FISHING_ACTIVITY");

  return (
    <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(90vh-240px)]">
      <div className="space-y-2">
        <Label htmlFor="waterBody">Water Body</Label>
        <MultiSelect
          options={waterBodies}
          selected={formik.values.waterBody || []}
          onChange={(value) => formik.setFieldValue("waterBody", value)}
          placeholder="Select water body type"
          maxDisplay={3}
          className="w-full"
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="threats">Threats</Label>
        <MultiSelect
          options={disturbances}
          selected={formik.values.threats || []}
          onChange={(value) => formik.setFieldValue("threats", value)}
          placeholder="Select threats"
          maxDisplay={3}
          className="w-full"
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
          />
        </div>
      )}
    </div>
  );
}
