"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { DateRange } from "react-day-picker";
import {
  useGetReportings,
  useGetReportingsInsights,
} from "@/services/reportings";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import StatisticsCardsSkeleton from "@/components/modules/reportings/StatisticsCardsSkeleton";
import StatisticsCards from "@/components/modules/reportings/StatisticsCards";
import Insights from "@/components/common/SubmissionsInsights";
import SubmissionsTable from "@/components/common/SubmissionsTable";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { APP_NAME } from "@/constants/constants";
import { useReportingsFilters } from "@/store/useReportingsFilters";
import { useSpecies } from "@/store/useSpecies";

export default function SubmissionReportingPage() {
  const { currentPage, setCurrentPage, totalRecords, districts, setDistricts } =
    useReportingsFilters();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const { data, isLoading } = useGetReportings(dateRange?.from, dateRange?.to);
  const { data: insightsData } = useGetReportingsInsights(
    dateRange?.from,
    dateRange?.to
  );
  const { species } = useSpecies();

  const [reportingId, setReportingId] = React.useState<string | null>(null);

  const handleSelect = (id: string) => setReportingId(id);

  const onClose = () => setReportingId(null);

  const onClearDateRange = () => setDateRange(undefined);

  const handleDistrictsChange = (districts: string[]) => {
    setDistricts(districts);
    setCurrentPage(0);
  };

  const pagination = { pageIndex: currentPage, pageSize: 10, totalRecords };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Reportings</title>
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
              dateRange={dateRange}
              onClearDateRange={onClearDateRange}
              entries={data?.result || []}
              onSelect={handleSelect}
              showDateFilter={false}
              pagination={pagination}
              setPagination={setCurrentPage}
              selectedDistricts={districts}
              setSelectedDistricts={handleDistrictsChange}
            />
          </div>
        </div>
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
