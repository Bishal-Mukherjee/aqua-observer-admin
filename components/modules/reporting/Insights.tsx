"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeciesDistributionPieChart } from "@/components/modules/reporting/SpeciesDistributionPieChart";
const ReportingMap = dynamic(
  () => import("@/components/modules/reporting/ReportingMap"),
  { ssr: false }
);
const DetailedRowDialog = dynamic(
  () => import("@/components/modules/reporting/DetailedRowDialog"),
  { ssr: false }
);

interface InsightsProps {
  data: any[];
}

export default function Insights({ data }: InsightsProps) {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleDialog = (params: any) => {
    setSelectedLocation(data?.find((item) => item.id === params.id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      {/* First Column - Charts */}
      <div className="space-y-4">
        <SpeciesDistributionPieChart data={data} />
      </div>

      {/* Second Column - Map */}
      <Card className="shadow-none border-none max-h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Reporting Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportingMap
            data={data}
            title="Reporting Locations"
            onMarkerClick={handleDialog}
          />
        </CardContent>
      </Card>

      {/* Detailed Row Dialog */}
      <DetailedRowDialog
        isOpen={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        reportData={selectedLocation}
      />
    </div>
  );
}
