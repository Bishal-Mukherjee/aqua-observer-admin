"use client";

import React, { useState } from "react";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useGetSpecies, useGetSpeciesSubmissions } from "@/services/species";
import { useSpeciesSubmissionPagination } from "@/store/pagination/useSpeciesSubmissionPagination";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import SubmissionDialog from "@/components/common/SubmissionDialog";

// TODO: integrate date range picker

export default function SpeciesSubmissionsPage() {
  const { submissions } = useParams();
  const search = useSearchParams();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { currentPage, setCurrentPage, totalRecords } =
    useSpeciesSubmissionPagination();

  const { data: species, isLoading: isLoadingSpecies } = useGetSpecies();

  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const submissionType =
    submissions === "reportings" ? "reportings" : "sightings";

  const { data, isLoading } = useGetSpeciesSubmissions(
    submissionType,
    search.get("species") || "",
    dateRange?.from,
    dateRange?.to
  );

  const results = data?.result || [];
  const speciesData = species?.result || [];

  const handleSelect = (id: string) => setSubmissionId(id);

  const onClose = () => setSubmissionId(null);

  if (!search.get("species")) {
    redirect("/species");
  }

  return (
    <>
      <div className="py-10 px-12 flex-1 bg-gray-50">
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
          isLoading={isLoading || isLoadingSpecies}
          entries={results}
          pagination={{
            pageIndex: currentPage,
            pageSize: 10,
            totalRecords,
          }}
          setPagination={setCurrentPage}
          onSelect={handleSelect}
          showSpecies={false}
          showDateFilter={false}
        />
      </div>
      <SubmissionDialog
        onClose={onClose}
        submissionId={submissionId}
        speciesData={speciesData}
        type={submissionType === "reportings" ? "REPORTING" : "SIGHTING"}
      />
    </>
  );
}
