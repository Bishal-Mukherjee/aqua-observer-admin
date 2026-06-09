"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetHomeDistribution } from "@/services/home";
import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import dayjs from "dayjs";

const COLORS = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1e40af"];
const OTHER_COLOR = "#adb5bd";

const toTitleCaseLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const formatPieLabel = (name: string) => {
  const words = name.split(" ");
  if (words.length === 3) {
    return `${words[0]}\n${words[1]} ${words[2]}`;
  }
  return words.join("\n");
};

interface DistributionData {
  region: string;
  count: number;
  color: string;
}

const LoadingSkeleton = () => (
  <Card className="col-span-1 shadow-none border-0">
    <CardHeader className="mb-0 px-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[280px] w-full flex items-center justify-center">
        <div className="relative">
          {/* Outer circle skeleton */}
          <Skeleton className="w-[200px] h-[200px] rounded-full" />
          {/* Inner circle (donut hole) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[140px] h-[140px] bg-white rounded-full flex flex-col items-center justify-center">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>
      </div>
      {/* Legend skeleton */}
      <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function DistributionOverviewDonut() {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );

  const { data, isLoading, error } = useGetHomeDistribution(selectedType);

  const chartOption = useMemo<EChartsOption>(() => {
    const result: any[] = data?.result || [];

    const chartData: DistributionData[] = result.map((item, index) => {
      if (item.region === "Others") {
        return {
          ...item,
          region: "Others",
          color: OTHER_COLOR,
        };
      }

      return {
        ...item,
        region: toTitleCaseLabel(item.region),
        color: COLORS[index % COLORS.length],
      };
    });

    const total = chartData.reduce(
      (sum, region) => sum + (region?.count || 0),
      0
    );

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "horizontal",
        left: "center",
        bottom: 0,
        textStyle: {
          fontSize: 12,
          color: "#374151",
        },
        itemWidth: 12,
        itemHeight: 12,
      },
      graphic: {
        type: "text",
        left: "center",
        top: "38%",
        style: {
          text: `Total ${
            selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
          }\n${total.toLocaleString()}`,
          textAlign: "center",
          fontSize: 14,
          lineHeight: 24,
        },
      },
      series: [
        {
          top: -52,
          type: "pie",
          radius: ["70", "100"],
          center: ["50%", "50%"],
          data: chartData.map((item) => ({
            name: item.region,
            value: item.count,
            itemStyle: {
              color: item.color,
            },
          })),
          label: {
            show: true,
            overflow: "none",
            fontSize: 10,
            formatter: (params: { name?: string }) =>
              formatPieLabel(params.name ?? ""),
          },
          labelLine: {
            show: true,
            length: 6,
            length2: 6,
            smooth: true,
          },
          labelLayout: {
            hideOverlap: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          animation: false,
        },
      ],
    };
  }, [data, selectedType]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="col-span-1 shadow-none border-0">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-red-500">Failed to load distribution data</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="col-span-1 shadow-none border-0">
      <CardHeader className="mb-0 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-md font-semibold">
              Distribution Overview
            </CardTitle>
          </div>
          <Select
            value={selectedType}
            onValueChange={(value: "sightings" | "reportings") =>
              setSelectedType(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sightings">Sightings</SelectItem>
              <SelectItem value="reportings">Reportings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground mt-[-8px]">
          Showing {selectedType} distribution by till <br />{" "}
          <span className="font-medium">{dayjs().format("MMM DD, YYYY")}</span>
        </span>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[360px] w-full">
          <ReactECharts
            option={chartOption}
            style={{ width: "100%", height: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
