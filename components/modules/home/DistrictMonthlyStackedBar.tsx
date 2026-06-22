"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetMonthlyDistrictSubmissions,
  useGetOverviewMonthly,
} from "@/services/home";
import { useState, useMemo, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import dayjs from "dayjs";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { useSpecies } from "@/store/useSpecies";

const InteractiveMap = dynamic(
  () => import("@/components/common/InteractiveMap"),
  { ssr: false }
);

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

export default function DistrictMonthlyStackedBar() {
  const { species } = useSpecies();
  const [selectedType, setSelectedType] = useState<"sightings" | "reportings">(
    "reportings",
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapData, setMapData] = useState<any[]>([]);
  const [mapTitle, setMapTitle] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );

  const { data, isLoading, error } = useGetOverviewMonthly(
    selectedType,
    selectedYear,
  );
  const {
    mutate: fetchMonthlyDistrictSubmissions,
    isPending: isMapDataLoading,
  } = useGetMonthlyDistrictSubmissions();

  const submissionType = selectedType === "reportings" ? "REPORTING" : "SIGHTING";

  const handleBarSegmentClick = useCallback(
    (params: {
      componentType?: string;
      seriesType?: string;
      seriesName?: string;
      name?: string;
      value?: number;
    }) => {
      if (
        params.componentType !== "series" ||
        params.seriesType !== "bar" ||
        !params.seriesName ||
        params.value === undefined ||
        params.value <= 0
      ) {
        return;
      }

      const monthLabel = params.name;
      const district = params.seriesName;

      if (!district || !monthLabel) return;

      setMapTitle(
        `${toTitleCaseLabel(district)} - ${monthLabel} ${selectedYear} ${selectedType}`
      );
      setMapData([]);
      setMapDialogOpen(true);

      fetchMonthlyDistrictSubmissions(
        {
          type: selectedType,
          year: selectedYear,
          month: monthLabel,
          district,
        },
        {
          onSuccess: (apiResponse) => {
            setMapData(apiResponse.result || []);
          },
          onError: (err) => {
            console.error(
              "Failed to fetch clicked month/district submissions:",
              err
            );
          },
        }
      );
    },
    [fetchMonthlyDistrictSubmissions, selectedType, selectedYear],
  );

  const handleMapDialogOpenChange = useCallback((open: boolean) => {
    setMapDialogOpen(open);
    if (!open) {
      setMapData([]);
      setSelectedSubmission(null);
    }
  }, []);

  const chartEvents = useMemo(
    () => ({
      click: handleBarSegmentClick,
    }),
    [handleBarSegmentClick],
  );

  const chartOption = useMemo<EChartsOption>(() => {
    const chartData = data?.result?.chartData || [];
    const regions = data?.result?.metadata?.regions || [];

    // Calculate max value for Y-axis domain
    const maxValue = Math.max(...chartData.map((item: any) => item.total || 0));
    const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: any) => {
          const month = params[0]?.axisValue;
          const total = params.reduce(
            (sum: number, entry: any) => sum + entry.value,
            0,
          );
          let tooltip = `<div>`;
          tooltip += `<p style="font-weight: 600; color: #374151; margin-bottom: 8px;">${month}</p>`;
          params.forEach((entry: any) => {
            if (entry.value > 0) {
              tooltip += `<p style="font-size: 12px; color: #475569; margin-top: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${
                  entry.color
                }; border-radius: 2px; margin-right: 6px;"></span>
                ${toTitleCaseLabel(entry.seriesName)}: ${
                  entry.value
                } ${selectedType}
              </p>`;
            }
          });
          tooltip += `<hr style="margin: 8px 0; border-color: #e5e7eb;" />`;
          tooltip += `<p style="font-size: 12px; font-weight: 600; color: #111827;">Total: ${total} ${selectedType}</p>`;
          tooltip += `</div>`;
          return tooltip;
        },
        backgroundColor: "#ffffff",
      },
      legend: {
        orient: "horizontal",
        left: "center",
        bottom: 20,
        textStyle: {
          fontSize: 12,
        },
        itemWidth: 14,
        itemHeight: 14,
        formatter: (name: string) => toTitleCaseLabel(name),
      },
      grid: {
        top: 20,
        right: 20,
        left: 40,
        bottom: 80,
        containLabel: false,
      },
      xAxis: {
        type: "category",
        data: chartData.map((item: any) => item.month),
        axisTick: {
          show: true,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          color: "#6B7280",
        },
      },
      yAxis: {
        type: "value",
        max: yAxisMax || 100,
        axisLabel: {
          fontSize: 12,
          color: "#6B7280",
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#E5E7EB",
          },
        },
      },
      series: regions.map((region: string, index: number) => ({
        name: region,
        type: "bar",
        stack: "total",
        cursor: "pointer",
        data: chartData.map((item: any) => item[region] || 0),
        itemStyle: {
          color: COLORS[index % COLORS.length],
        },
        emphasis: {
          focus: "series",
        },
      })),
    };
  }, [data, selectedType]);

  const getYearOptions = useCallback(() => {
    const currentYear = dayjs().year();
    const MAX_YEARS = 4;
    return Array.from({ length: MAX_YEARS }, (_, i) => currentYear - i).map(
      (year) => ({
        label: year.toString(),
        value: year.toString(),
      }),
    );
  }, []);

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

  const summary = data?.result?.summary || {};

  return (
    <>
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
                {getYearOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
          <ReactECharts
            option={chartOption}
            style={{ width: "100%", height: "100%" }}
            opts={{ renderer: "canvas" }}
            onEvents={chartEvents}
          />
        </div>
      </CardContent>
      </Card>

      <InteractiveMap
        variant="dialog"
        open={mapDialogOpen}
        onOpenChange={handleMapDialogOpenChange}
        isLoading={isMapDataLoading}
        data={mapData}
        title={mapTitle}
        onLocationSelect={setSelectedSubmission}
      />

      <SubmissionDialog
        submissionId={selectedSubmission}
        speciesData={species}
        onClose={() => setSelectedSubmission(null)}
        type={submissionType}
      />
    </>
  );
}
