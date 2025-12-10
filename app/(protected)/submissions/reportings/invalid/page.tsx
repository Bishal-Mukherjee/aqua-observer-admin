"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  useGetReportings,
  useGetReportingsInBatch,
} from "@/services/reportings";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { APP_NAME } from "@/constants/constants";
import { useReportingsFilters } from "@/store/useReportingsFilters";
import { useSpecies } from "@/store/useSpecies";
import { convertReportingsToCSV } from "@/lib/convertToCSV";

const exportToCSV = (
  data: any[],
  fileName: string,
  onError: (error: Error) => void
) => {
  try {
    const csvData = convertReportingsToCSV(data);
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

export default function InvalidReportings() {
  const { currentPage, setCurrentPage, totalRecords, districts, setDistricts } =
    useReportingsFilters();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const { data, isLoading } = useGetReportings(dateRange?.from, dateRange?.to);

  const { mutate } = useGetReportingsInBatch();

  const { species } = useSpecies();

  const [reportingId, setReportingId] = React.useState<string | null>(null);

  const handleSelect = (id: string) => setReportingId(id);

  const onClose = () => setReportingId(null);

  const onClearDateRange = () => setDateRange(undefined);

  const handleDistrictsChange = (districts: string[]) => {
    setDistricts(districts);
    setCurrentPage(0);
  };

  const handleExportCSV = () => {
    const ids = data?.result.map((item: { id: string }) => item.id) || [];
    mutate(ids, {
      onSuccess: (res) => {
        exportToCSV(res.result, "reportings_export.csv", (error: Error) =>
          toast.error(`Error exporting reportings: ${error.message}`)
        );
      },
      onError: (error: Error) => {
        toast.error(`Error exporting reportings: ${error.message}`);
      },
    });
  };

  const pagination = { pageIndex: currentPage, pageSize: 10, totalRecords };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Invlaid Reportings</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="flex items-start justify-between mb-4">
          <RouteBreadcrumbs />
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
          <p className="text-sm font-medium">
            These are reportings that have been marked as <b>invalid</b> by an
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
        submissionId={reportingId}
        onClose={onClose}
        speciesData={species || []}
        type="REPORTING"
      />
    </Fragment>
  );
}
