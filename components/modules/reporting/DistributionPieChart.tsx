"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SpeciesData {
  type: string;
  adultMale: { stranded: number; injured: number; dead: number };
  adultFemale: { stranded: number; injured: number; dead: number };
  subAdult: { stranded: number; injured: number; dead: number };
}

interface ReportingItem {
  id: string;
  district: string;
  species: SpeciesData[];
  observed_at: string;
  type: string;
}

interface DistributionPieChartProps {
  data: ReportingItem[];
}

type DistributionType = "districts" | "species" | "status";

// Bluish color palette
const CHART_COLORS = [
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1e40af",
  "#1d4ed8",
  "#1e3a8a",
  "#312e81",
  "#4338ca",
  "#5b21b6",
];

export default function DistributionPieChart({
  data,
}: DistributionPieChartProps) {
  const [selectedDistribution, setSelectedDistribution] =
    useState<DistributionType>("districts");

  const processedData = useMemo(() => {
    let aggregatedData: Record<string, number> = {};

    switch (selectedDistribution) {
      case "districts":
        // Count reports by district
        data.forEach((item) => {
          const district = item.district.replace(/_/g, " ");
          aggregatedData[district] = (aggregatedData[district] || 0) + 1;
        });
        break;

      case "species":
        // Count animals by species type
        data.forEach((item) => {
          item.species.forEach((species) => {
            const speciesName = species.type.replace(/_/g, " ");
            const totalCount =
              species.adultMale.stranded +
              species.adultMale.injured +
              species.adultMale.dead +
              species.adultFemale.stranded +
              species.adultFemale.injured +
              species.adultFemale.dead +
              species.subAdult.stranded +
              species.subAdult.injured +
              species.subAdult.dead;

            if (totalCount > 0) {
              aggregatedData[speciesName] =
                (aggregatedData[speciesName] || 0) + totalCount;
            }
          });
        });
        break;

      case "status":
        // Count animals by status (stranded, injured, dead)
        const statusTotals = { stranded: 0, injured: 0, dead: 0 };

        data.forEach((item) => {
          item.species.forEach((species) => {
            [species.adultMale, species.adultFemale, species.subAdult].forEach(
              (ageGroup) => {
                statusTotals.stranded += ageGroup.stranded;
                statusTotals.injured += ageGroup.injured;
                statusTotals.dead += ageGroup.dead;
              }
            );
          });
        });

        aggregatedData = {
          Stranded: statusTotals.stranded,
          Injured: statusTotals.injured,
          Dead: statusTotals.dead,
        };
        break;
    }

    // Convert to array, filter out zero values, and sort by value
    let chartEntries = Object.entries(aggregatedData)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => ({ name: key, value }));

    // Limit to top 5 for districts and species
    if (
      selectedDistribution === "districts" ||
      selectedDistribution === "species"
    ) {
      const top5 = chartEntries.slice(0, 5);
      const remainingCount = chartEntries
        .slice(5)
        .reduce((sum, item) => sum + item.value, 0);

      // Add "Others" category if there are more than 5 items
      if (remainingCount > 0) {
        top5.push({ name: "Others", value: remainingCount });
      }

      chartEntries = top5;
    }

    return chartEntries;
  }, [data, selectedDistribution]);

  const getTotalLabel = () => {
    const labels = {
      districts: "Total Reports",
      species: "Total Animals",
      status: "Total Animals",
    };
    return labels[selectedDistribution];
  };

  const chartOptions = {
    chart: {
      type: "donut" as const,
      height: 350, // Ensure consistent height
      toolbar: {
        show: false,
      },
    },
    colors: CHART_COLORS.slice(0, processedData.length),
    labels: processedData.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom" as const,
      offsetY: 12,
      itemMargin: {
        horizontal: 4,
        vertical: 8,
      },
      fontSize: "12px",
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
              label: getTotalLabel(),
              fontWeight: 600,
              color: "#374151",
              formatter: () => {
                const total = processedData.reduce(
                  (sum, item) => sum + item.value,
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
        formatter: (value: number) => {
          const suffix =
            selectedDistribution === "districts" ? "reports" : "animals";
          return `${value} ${suffix}`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const chartSeries = processedData.map((item) => item.value);

  return (
    <Card className="h-[500px] shadow-none border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Reportings</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution overview</p>
        </div>
        <Select
          value={selectedDistribution}
          onValueChange={(value: DistributionType) =>
            setSelectedDistribution(value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select distribution" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Distribution Type</SelectLabel>
              <SelectItem value="districts">Districts</SelectItem>
              <SelectItem value="species">Species</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {processedData.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartSeries}
			height={350}
            type="donut"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available for the selected distribution
          </div>
        )}
      </CardContent>
    </Card>
  );
}
