"use client";

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
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1e40af"];

const toTitleCaseLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

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

const CustomTooltip = ({ active, payload, total, selectedType }: any) => {
  if (active && payload && payload.length) {
    const percentage = ((payload[0].value / total) * 100).toFixed(1);
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900">
          {payload[0].payload.region}
        </p>
        <p className="text-sm text-gray-600">
          {payload[0].value.toLocaleString()} {selectedType}
        </p>
        <p className="text-xs text-gray-500">{percentage}% of total</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data }: { data: DistributionData[] }) => (
  <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
    {data.map((entry, index) => (
      <div key={index} className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 font-medium">{entry.region}</span>
        </div>
      </div>
    ))}
  </div>
);

const DonutCenter = ({
  total,
  selectedType,
}: {
  total: number;
  selectedType: string;
}) => (
  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="central"
    className="fill-gray-900"
  >
    <tspan
      x="50%"
      dy="-0.5em"
      fontSize="14"
      fontWeight="600"
      className="fill-gray-600"
    >
      Total {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
    </tspan>
    <tspan
      x="50%"
      dy="1em"
      fontSize="24"
      fontWeight="bold"
      className="fill-gray-900"
    >
      {total.toLocaleString()}
    </tspan>
  </text>
);

export default function DistributionOverviewDonut() {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );

  const { data, isLoading, error } = useGetHomeDistribution(selectedType);

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

  const result: any[] = data?.result || [];

  const chartData: DistributionData[] = result.map((item, index) => ({
    ...item,
    region: toTitleCaseLabel(item.region),
    color: COLORS[index % COLORS.length],
  }));

  const total = chartData.reduce(
    (sum, region) => sum + (region?.count || 0),
    0
  );

  return (
    <Card className="col-span-1 shadow-none border-0">
      <CardHeader className="mb-0 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-md font-semibold">
              Distribution Overview
            </CardTitle>
            {/* <p className="text-xs text-muted-foreground">
              (+43%) than last year
            </p> */}
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
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full flex items-center justify-center">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <CustomTooltip total={total} selectedType={selectedType} />
                }
              />
              <DonutCenter total={total} selectedType={selectedType} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend data={chartData} />
      </CardContent>
    </Card>
  );
}
