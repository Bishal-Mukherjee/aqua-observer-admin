"use client";

import React, { useState } from "react";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useGetSpeciesSubmissions } from "@/services/species";
import { useSpeciesSubmissionPagination } from "@/store/pagination/useSpeciesSubmissionPagination";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { useSpecies } from "@/store/useSpecies";

export default function SpeciesSubmissionsPage() {
  const { submissions } = useParams();
  const search = useSearchParams();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { currentPage, setCurrentPage, totalRecords, districts, setDistricts } =
    useSpeciesSubmissionPagination();

  const { species } = useSpecies();

  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const submissionType =
    submissions === "reportings" ? "reportings" : "sightings";

  const { data, isLoading } = useGetSpeciesSubmissions(
    dateRange?.from,
    dateRange?.to
  );

  const results = data?.result || [];

  const handleSelect = (id: string) => setSubmissionId(id);

  const onClose = () => setSubmissionId(null);

  if (!search.get("species")) {
    redirect("/species");
  }

  const onClearDateRange = () => setDateRange(undefined);

  const pagination = {
    pageIndex: currentPage,
    pageSize: 10,
    totalRecords,
  };

  return (
    <>
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
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="Select date range"
            numberOfMonths={2}
            className="w-[240px]"
          />
        </div>
        <SubmissionsTable
          isLoading={isLoading}
          dateRange={dateRange}
          onClearDateRange={onClearDateRange}
          entries={results}
          pagination={pagination}
          setPagination={setCurrentPage}
          onSelect={handleSelect}
          showSpecies={false}
          showDateFilter={false}
          selectedDistricts={districts}
          setSelectedDistricts={setDistricts}
        />
      </div>
      <SubmissionDialog
        onClose={onClose}
        submissionId={submissionId}
        speciesData={species}
        type={submissionType === "reportings" ? "REPORTING" : "SIGHTING"}
      />
    </>
  );
}
