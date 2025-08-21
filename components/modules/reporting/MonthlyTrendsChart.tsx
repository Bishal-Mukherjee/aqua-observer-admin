"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface MonthlyTrendsChartProps {
  data: ReportingItem[];
}

export default function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const processedData = useMemo(() => {
    // Group data by month
    const monthlyData: Record<string, { reports: number; animals: number }> =
      {};

    data.forEach((item) => {
      if (item.observed_at) {
        const date = new Date(item.observed_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { reports: 0, animals: 0 };
        }

        monthlyData[monthKey].reports += 1;

        // Count animals
        const animalCount = item.species.reduce((total, species) => {
          return (
            total +
            species.adultMale.stranded +
            species.adultMale.injured +
            species.adultMale.dead +
            species.adultFemale.stranded +
            species.adultFemale.injured +
            species.adultFemale.dead +
            species.subAdult.stranded +
            species.subAdult.injured +
            species.subAdult.dead
          );
        }, 0);

        monthlyData[monthKey].animals += animalCount;
      }
    });

    // Sort by month and prepare data for chart
    const sortedMonths = Object.keys(monthlyData).sort();

    return {
      categories: sortedMonths.map((month) => {
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }),
      reports: sortedMonths.map((month) => monthlyData[month].reports),
      animals: sortedMonths.map((month) => monthlyData[month].animals),
    };
  }, [data]);

  const chartOptions = {
    chart: {
      type: "line" as const,
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#3b82f6", "#10b981"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 5,
    },
    xaxis: {
      categories: processedData.categories,
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Reports",
          style: {
            color: "#3b82f6",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#3b82f6",
            fontSize: "12px",
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Animals",
          style: {
            color: "#10b981",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#10b981",
            fontSize: "12px",
          },
        },
      },
    ],
    legend: {
      position: "top" as const,
      horizontalAlign: "right" as const,
      offsetY: -10,
      fontSize: "12px",
      itemMargin: {
        horizontal: 10,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (value: number) => `${value} reports`,
        },
        {
          formatter: (value: number) => `${value} animals`,
        },
      ],
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

  const chartSeries = [
    {
      name: "Reports",
      type: "line",
      yAxisIndex: 0,
      data: processedData.reports,
    },
    {
      name: "Animals",
      type: "line",
      yAxisIndex: 1,
      data: processedData.animals,
    },
  ];

  return (
    <Card className="h-[500px] shadow-none border-none">
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">
            Monthly Trends
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Reports and animals over time
          </p>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] p-1">
        {processedData.categories.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={350}
            width="100%"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available for monthly trends
          </div>
        )}
      </CardContent>
    </Card>
  );
}
