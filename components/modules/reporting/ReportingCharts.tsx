"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeciesDistributionPieChart } from "@/components/modules/reporting/SpeciesDistributionPieChart";
import { DistrictWiseBarChart } from "@/components/modules/reporting/DistrictWiseBarChart";
const ReportingMap = dynamic(
  () => import("@/components/modules/reporting/ReportingMap"),
  { ssr: false }
);

interface ReportingChartsProps {
  data: any[];
}

export default function ReportingCharts({ data }: ReportingChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      {/* First Column - Charts */}
      <div className="space-y-4">
        {/* Species Distribution Pie Chart */}
        <SpeciesDistributionPieChart data={data} />

        {/* District-wise Reports Bar Chart */}
        <DistrictWiseBarChart data={data} />
      </div>

      {/* Second Column - Map */}
      <Card className="shadow-none border-none max-h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Reporting Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportingMap data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
