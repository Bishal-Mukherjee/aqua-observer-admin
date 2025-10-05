"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import { useGetReportings } from "@/services/reportings";
import { useGetSightings } from "@/services/sightings";
import { useReportingsFilters } from "@/store/useReportingsFilters";
import { useSightingsFilters } from "@/store/useSightingsFilters";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import { useSpecies } from "@/store/useSpecies";

export default function UserSubmissions() {
  const pathname = usePathname();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const {
    currentPage: currentPageSightings,
    setCurrentPage: setCurrentPageSightings,
    totalRecords: totalRecordsSightings,
    districts: selectedSightingsDistricts,
    setDistricts: setSightingsDistricts,
    clearStore: clearSightingsStore,
  } = useSightingsFilters();

  const {
    currentPage: currentPageReportings,
    setCurrentPage: setCurrentPageReportings,
    totalRecords: totalRecordsReportings,
    districts: selectedReportingsDistricts,
    setDistricts: setReportingsDistricts,
    clearStore: clearReportingsStore,
  } = useReportingsFilters();

  const isReportings = pathname.includes("reportings");

  const { species } = useSpecies();
  const { data: reportings, isLoading: isLoadingReportings } = useGetReportings(
    dateRange?.from,
    dateRange?.to,
    isReportings
  );
  const { data: sightings, isLoading: isLoadingSightings } = useGetSightings(
    dateRange?.from,
    dateRange?.to,
    !isReportings
  );

  const results = isReportings
    ? reportings?.result || []
    : !isReportings
    ? sightings?.result || []
    : [];

  const pagination = isReportings
    ? {
        pageIndex: currentPageReportings,
        totalRecords: totalRecordsReportings,
      }
    : {
        pageIndex: currentPageSightings,
        totalRecords: totalRecordsSightings,
      };

  const onClearDateRange = () => setDateRange(undefined);

  useEffect(() => {
    return () => {
      if (isReportings) {
        clearReportingsStore();
      } else {
        clearSightingsStore();
      }
    };
  }, []);

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <RouteBreadcrumbs />
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          placeholder="Select date range"
          numberOfMonths={2}
          className="w-[240px]"
        />
      </div>
      <SubmissionsTable
        isLoading={isLoadingReportings || isLoadingSightings}
        dateRange={dateRange}
        onClearDateRange={onClearDateRange}
        entries={results}
        onSelect={setSubmissionId}
        showSubmittedBy={false}
        showDateFilter={false}
        pagination={{ ...pagination, pageSize: 10 }}
        setPagination={
          isReportings ? setCurrentPageReportings : setCurrentPageSightings
        }
        selectedDistricts={
          isReportings
            ? selectedReportingsDistricts
            : selectedSightingsDistricts
        }
        setSelectedDistricts={
          isReportings ? setReportingsDistricts : setSightingsDistricts
        }
      />
      <SubmissionDialog
        submissionId={submissionId}
        onClose={() => setSubmissionId(null)}
        speciesData={species || []}
        hideOtherSubmissions
        type={pathname.includes("reportings") ? "REPORTING" : "SIGHTING"}
      />
    </>
  );
}
