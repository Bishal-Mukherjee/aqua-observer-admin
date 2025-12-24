"use client";

import React, { useState, Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useGetSightings, useGetSightingsInBatch } from "@/services/sightings";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
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

export default function InvalidSightings() {
  const { currentPage, setCurrentPage, totalRecords, districts, setDistricts } =
    useSightingsFilters();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { data, isLoading } = useGetSightings(dateRange?.from, dateRange?.to);
  const { mutate } = useGetSightingsInBatch();

  const { species } = useSpecies();

  const [sightingId, setSightingId] = useState<string | null>(null);

  const handleSelect = (id: string) => setSightingId(id);

  const onClose = () => setSightingId(null);

  const onClearDateRange = () => setDateRange(undefined);

  const handleDistrictsChange = (districts: string[]) => {
    setDistricts(districts);
    setCurrentPage(0);
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
          <RouteBreadcrumbs />
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
          <p className="text-sm font-medium">
            These are sightings that have been marked as <b>invalid</b> by an
            administrator.
          </p>
        </div>

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

      <SubmissionDialog
        onClose={onClose}
        submissionId={sightingId}
        speciesData={species || []}
        type="SIGHTING"
      />
    </Fragment>
  );
}
