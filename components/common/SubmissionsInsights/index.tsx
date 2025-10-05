"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isEmpty } from "lodash";
import { PieChart, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { default as ReportingSpeciesDistribution } from "@/components/modules/reportings/SpeciesDistributionPieChart";
import { default as SightingSpeciesDistribution } from "@/components/modules/sightings/SpeciesDistributionPieChart";
import PieChartSkeleton from "@/components/common/SubmissionsInsights/PieChartSkeleton";
const InteractiveMap = dynamic(
  () => import("@/components/common/InteractiveMap"),
  { ssr: false }
);
import SubmissionsMapSkeleton from "@/components/common/InteractiveMap/Skeleton";

interface InsightsProps {
  data: any[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}

function SpeciesDistributionEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full text-gray-400">
      <PieChart className="w-12 h-12" />
      <span className="text-sm">No species data available</span>
    </div>
  );
}

function SubmissionsMapEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full text-gray-400">
      <Map className="w-12 h-12" />
      <span className="text-sm">No locations data available</span>
    </div>
  );
}

export default function Insights({ data, isLoading, onSelect }: InsightsProps) {
  const pathname = usePathname();
  const submissionType = pathname.includes("reportings")
    ? "Reporting"
    : "Sighting";
  const mapTitle =
    submissionType === "Reporting"
      ? "Reporting Locations"
      : "Sighting Locations";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      {/* First Column - Charts */}
      <Card className="shadow-none border-none max-h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Species Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[450px]">
          {isLoading ? (
            <PieChartSkeleton />
          ) : (
            <>
              {submissionType === "Reporting" ? (
                <>
                  {isEmpty(data) ? (
                    <SpeciesDistributionEmptyState />
                  ) : (
                    <ReportingSpeciesDistribution data={data} />
                  )}
                </>
              ) : (
                <>
                  {isEmpty(data) ? (
                    <SpeciesDistributionEmptyState />
                  ) : (
                    <SightingSpeciesDistribution data={data} />
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Second Column - Map */}
      <Card className="shadow-none border-none max-h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            {submissionType} Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[450px]">
          {isLoading ? (
            <SubmissionsMapSkeleton />
          ) : (
            <>
              {isEmpty(data) ? (
                <SubmissionsMapEmptyState />
              ) : (
                <InteractiveMap
                  isLoading={isLoading}
                  data={data}
                  title={mapTitle}
                  onLocationSelect={onSelect}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
