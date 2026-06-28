"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import { Helmet } from "react-helmet-async";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { ChevronRight, FileDown, Loader } from "lucide-react";
import dayjs from "dayjs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetSightings,
  useGetSightingsInBatch,
  useGetSightingsInsights,
} from "@/services/sightings";
import { useFetchFilteredDocs } from "@/services/reports";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import StatisticsCardsSkeleton from "@/components/modules/reportings/StatisticsCardsSkeleton";
import StatisticsCards from "@/components/modules/sightings/StatisticsCards";
import Insights from "@/components/common/SubmissionsInsights";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { APP_NAME } from "@/constants/constants";
import { useSightingsFilters } from "@/store/useSightingsFilters";
import { useSpecies } from "@/store/useSpecies";
import { convertSightingsToCSV } from "@/lib/convertToCSV";

const exportToCSV = (
  data: any[],
  fileName: string,
  onError: (error: Error) => void
) => {
  try {
    const csvData = convertSightingsToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error("An unknown error occurred during CSV export."));
    }
  }
};

export default function SubmissionSightingPage() {
  const { currentPage, setCurrentPage, totalRecords, districts, setDistricts } =
    useSightingsFilters();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const { data, isLoading } = useGetSightings(dateRange?.from, dateRange?.to);
  const { data: insightsData } = useGetSightingsInsights(
    dateRange?.from,
    dateRange?.to
  );
  const { mutate } = useGetSightingsInBatch();
  const { mutate: mutateFilteredDocs, isPending: isFetchingFilteredDocs } =
    useFetchFilteredDocs();

  const { species } = useSpecies();

  const [sightingId, setSightingId] = React.useState<string | null>(null);

  const handleSelect = (id: string) => setSightingId(id);

  const onClose = () => setSightingId(null);

  const onClearDateRange = () => setDateRange(undefined);

  const handleDistrictsChange = (districts: string[]) => {
    setDistricts(districts);
    setCurrentPage(0);
  };

  const handleGenerateReportByDate = () => {
    mutateFilteredDocs(
      { dateRange: dateRange, submissionType: "sightings" } as any, // Explicitly cast to `any` to bypass type mismatch
      {
        onSuccess: (res) => {
          exportToCSV(res.result, "sightings_export.csv", (error: Error) =>
            toast.error(`Error exporting sightings: ${error.message}`)
          );
        },
        onError: (error: Error) => {
          toast.error(`Error exporting sightings: ${error.message}`);
        },
      }
    );
  };

  const handleExportCSV = () => {
    const ids = data?.result.map((item: { id: string }) => item.id) || [];
    mutate(ids, {
      onSuccess: (res) => {
        exportToCSV(res.result, "sightings_export.csv", (error: Error) =>
          toast.error(`Error exporting sightings: ${error.message}`)
        );
      },
      onError: (error: Error) => {
        toast.error(`Error exporting sightings: ${error.message}`);
      },
    });
  };

  const pagination = { pageIndex: currentPage, pageSize: 10, totalRecords };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Sightings</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <RouteBreadcrumbs />
            {dateRange?.from && dateRange?.to && (
              <p className="text-xs text-muted-foreground mt-2">
                Viewing data from {dayjs(dateRange.from).format("D MMM, YYYY")} to {dayjs(dateRange.to).format("D MMM, YYYY")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              placeholder="Select date range"
              numberOfMonths={2}
              className="w-[240px]"
            />

            {dateRange && (
              <Tooltip>
                <TooltipTrigger
                  onClick={handleGenerateReportByDate}
                  role="button"
                >
                  <div className="p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                    {isFetchingFilteredDocs ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4 cursor-pointer" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Export Sightings from&nbsp;
                  {dayjs(dateRange.from).format("D MMM, YYYY")} to&nbsp;
                  {dayjs(dateRange.to).format("D MMM, YYYY")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {isLoading ? (
          <StatisticsCardsSkeleton />
        ) : (
          <StatisticsCards data={data?.result || []} />
        )}

        <div>
          <Insights
            isLoading={isLoading}
            data={insightsData?.result || []}
            onSelect={handleSelect}
          />
          <div className="mt-4">
            <SubmissionsTable
              isLoading={isLoading}
              dateRange={dateRange}
              onClearDateRange={onClearDateRange}
              entries={data?.result || []}
              onSelect={handleSelect}
              onExportCSV={handleExportCSV}
              showDateFilter={false}
              pagination={pagination}
              setPagination={setCurrentPage}
              selectedDistricts={districts}
              setSelectedDistricts={handleDistrictsChange}
            />
          </div>

          <div className="flex items-center justify-end mt-4 mr-8 hover:underline">
            <Link href="sightings/invalid" className="text-xs text-blue-600">
              Invalid Sightings
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>
      </div>

      <SubmissionDialog
        onClose={onClose}
        submissionId={sightingId}
        speciesData={species || []}
        type="SIGHTING"
      />
    </Fragment>
  );
}
