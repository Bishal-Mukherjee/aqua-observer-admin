"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { DateRange } from "react-day-picker";
import { useGetSpecies } from "@/services/species";
import { useGetSightings, useGetSightingsInsights } from "@/services/sightings";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import StatisticsCardsSkeleton from "@/components/modules/reportings/StatisticsCardsSkeleton";
import StatisticsCards from "@/components/modules/sightings/StatisticsCards";
import Insights from "@/components/common/SubmissionsInsights";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { APP_NAME } from "@/constants/constants";
import { useSightingsPagination } from "@/store/pagination/useSightingsPagination";

export default function SubmissionSightingPage() {
  const { currentPage, setCurrentPage, totalRecords } =
    useSightingsPagination();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const { data, isLoading } = useGetSightings(
    undefined,
    dateRange?.from,
    dateRange?.to
  );
  const { data: insightsData } = useGetSightingsInsights(
    dateRange?.from,
    dateRange?.to
  );
  const { data: speciesData } = useGetSpecies();

  const [sightingId, setSightingId] = React.useState<string | null>(null);

  const handleSelect = (id: string) => setSightingId(id);

  const onClose = () => setSightingId(null);

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Sightings</title>
      </Helmet>
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
              entries={data?.result || []}
              onSelect={handleSelect}
              showDateFilter={false}
              pagination={{
                pageIndex: currentPage,
                pageSize: 10,
                totalRecords,
              }}
              setPagination={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <SubmissionDialog
        onClose={onClose}
        submissionId={sightingId}
        speciesData={speciesData?.result || []}
        type="SIGHTING"
      />
    </Fragment>
  );
}
