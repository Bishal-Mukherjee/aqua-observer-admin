"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const monthlyData = [
  { month: "Jan", murshidabad: 18, hooghly: 12, howrah: 8, south24parganas: 6 },
  {
    month: "Feb",
    murshidabad: 25,
    hooghly: 18,
    howrah: 12,
    south24parganas: 8,
  },
  {
    month: "Mar",
    murshidabad: 22,
    hooghly: 15,
    howrah: 10,
    south24parganas: 7,
  },
  {
    month: "Apr",
    murshidabad: 28,
    hooghly: 20,
    howrah: 14,
    south24parganas: 9,
  },
  {
    month: "May",
    murshidabad: 18,
    hooghly: 25,
    howrah: 18,
    south24parganas: 12,
  },
  {
    month: "Jun",
    murshidabad: 30,
    hooghly: 22,
    howrah: 16,
    south24parganas: 10,
  },
  {
    month: "Jul",
    murshidabad: 5,
    hooghly: 28,
    howrah: 20,
    south24parganas: 14,
  },
  {
    month: "Aug",
    murshidabad: 12,
    hooghly: 24,
    howrah: 17,
    south24parganas: 11,
  },
  {
    month: "Sep",
    murshidabad: 26,
    hooghly: 19,
    howrah: 13,
    south24parganas: 8,
  },
  {
    month: "Oct",
    murshidabad: 16,
    hooghly: 26,
    howrah: 19,
    south24parganas: 13,
  },
  {
    month: "Nov",
    murshidabad: 29,
    hooghly: 21,
    howrah: 15,
    south24parganas: 10,
  },
];

export default function TopObservers() {
  const chartOptions = {
    chart: {
      type: "bar" as const,
      height: 200,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    // Updated color palette to subtle yet evident shades of blue
    colors: ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "56%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    xaxis: {
      categories: monthlyData.map((item) => item.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: true,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
      max: 80,
    },
    legend: {
      show: true,
      position: "bottom" as const,
      offsetY: 12,
      itemMargin: {
        horizontal: 6,
      },
      markers: {
        size: 7,
        shape: undefined,
        strokeWidth: 1,
        fillColors: undefined,
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0,
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${value} sightings`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Murshidabad",
      data: monthlyData.map((item) => item.murshidabad),
    },
    {
      name: "Hooghly",
      data: monthlyData.map((item) => item.hooghly),
    },
    {
      name: "Howrah",
      data: monthlyData.map((item) => item.howrah),
    },
    {
      name: "South 24 Parganas",
      data: monthlyData.map((item) => item.south24parganas),
    },
  ];

  return (
    <Card className="col-span-2 shadow-none border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Monthly Sightings by District
        </CardTitle>
        {/* <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Murshidabad</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Hooghly</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-muted-foreground">Howrah</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs text-muted-foreground">
              South 24 Parganas
            </span>
          </div>
        </div> */}
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={320}
          />
        </div>
      </CardContent>
    </Card>
  );
}
