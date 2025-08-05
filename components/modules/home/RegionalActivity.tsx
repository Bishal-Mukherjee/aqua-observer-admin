"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const regionData = [
  { region: "Murshidabad", sightings: 342, percentage: 85, color: "#3B82F6" },
  { region: "Hooghly", sightings: 198, percentage: 65, color: "#10B981" },
  { region: "Howrah", sightings: 156, percentage: 45, color: "#F59E0B" },
  {
    region: "South 24 Parganas",
    sightings: 89,
    percentage: 30,
    color: "#EF4444",
  },
  { region: "Nadia", sightings: 72, percentage: 25, color: "#6366F1" },
];

export default function RegionalActivity() {
  const chartOptions = {
    chart: {
      type: "donut" as const,
      height: 300,
      toolbar: {
        show: false,
      },
    },
    colors: regionData.map((region) => region.color),
    labels: regionData.map((region) => region.region),
    legend: {
      show: false, // Disable ApexCharts' built-in legend
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Sightings",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              formatter: () => {
                const total = regionData.reduce(
                  (sum, region) => sum + region.sightings,
                  0
                );
                return total.toLocaleString();
              },
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#111827",
            },
          },
        },
      },
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} sightings`,
      },
    },
  };

  const chartSeries = regionData.map((region) => region.sightings);

  return (
    <Card className="col-span-1 shadow-none border-0">
      <CardHeader className="mb-0">
        <CardTitle className="text-lg font-semibold">
          Distribution Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">(+43%) than last year</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center border-b pb-2">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={280}
            width="100%"
          />
        </div>
        {/* Legend Section */}
        <div className="mt-6 grid grid-cols-3 gap-y-4 gap-x-4">
          {regionData.map((region, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-xs text-gray-700">{region.region}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
