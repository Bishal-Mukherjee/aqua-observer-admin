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
import { useGetOverviewMonthly } from "@/services/home";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Color palette for different districts
const COLORS = [
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1e40af",
  "#1e3a8a",
];

const toTitleCaseLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const LoadingSkeleton = () => (
  <Card className="col-span-2 shadow-none border-0">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-60 mb-2" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </CardHeader>
    <CardContent className="h-[300px]">
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-full space-y-4">
          {/* Chart skeleton */}
          <div className="flex justify-between items-end h-[250px] px-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <Skeleton className="w-8 h-32" />
                <Skeleton className="w-6 h-3" />
              </div>
            ))}
          </div>
          {/* Legend skeleton */}
          <div className="flex justify-center gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton className="w-3 h-3 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label, selectedType }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, entry: any) => sum + entry.value,
      0
    );

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700 mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-slate-600 mt-1">
            {toTitleCaseLabel(entry.dataKey)}: {entry.value} {selectedType}
          </p>
        ))}
        <hr className="my-1 border-gray-200" />
        <p className="text-xs font-medium text-gray-800">
          Total: {total} {selectedType}
        </p>
      </div>
    );
  }
  return null;
};

export default function DistrictMonthlyStackedBar() {
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings"
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const { data, isLoading, error } = useGetOverviewMonthly(
    selectedType,
    selectedYear
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="col-span-2 shadow-none border-0">
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-red-500">Failed to load monthly statistics</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.result?.chartData || [];
  const regions = data?.result?.metadata?.regions || [];
  const summary = data?.result?.summary || {};

  // Calculate max value for Y-axis domain
  const maxValue = Math.max(...chartData.map((item: any) => item.total || 0));
  const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding

  return (
    <Card className="col-span-2 shadow-none border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Monthly{" "}
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} by
              District
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {summary.total?.toLocaleString() || 0} {selectedType} in{" "}
              {selectedYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem> */}
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: -20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={true}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                domain={[0, yAxisMax || 100]}
              />
              <Tooltip
                content={<CustomTooltip selectedType={selectedType} />}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "12px",
                  fontSize: "12px",
                }}
                iconType="rect"
                iconSize={7}
                formatter={(value) => toTitleCaseLabel(value)}
              />
              {regions.map((region: string, index: number) => (
                <Bar
                  key={region}
                  dataKey={region}
                  name={toTitleCaseLabel(region)}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  radius={
                    index === regions.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
