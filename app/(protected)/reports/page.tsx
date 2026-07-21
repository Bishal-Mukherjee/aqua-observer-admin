"use client";

import React, { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "@/constants/constants";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import CreateReportDialog from "@/components/modules/reports/CreateReportDialog";
import { useInitializeStaticLookup } from "@/hooks/useInitializeStaticLookup";
import { useFetchGeneratedReports } from "@/services/reports";
import ReportsList from "@/components/modules/reports/ReportsList";
import ReportDetailedDialog from "@/components/modules/reports/ReportDetailedDialog";
import { useReportsFilters } from "@/store/useReportsFilters";

export default function ReportsPage() {
  useInitializeStaticLookup();

  const { currentPage, totalRecords, setCurrentPage } = useReportsFilters();
  const { data: reports, isLoading } = useFetchGeneratedReports();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleSelect = (id: string) => setSelectedReportId(id);
  const handleCloseDialog = () => setSelectedReportId(null);

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Reports</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="flex items-start justify-between mb-4">
          <RouteBreadcrumbs />
          <CreateReportDialog />
        </div>
        <ReportsList
          isLoading={isLoading}
          reports={reports?.result || []}
          onSelect={handleSelect}
          pagination={{
            pageIndex: currentPage,
            pageSize: 10,
            totalRecords,
          }}
          setPagination={setCurrentPage}
        />
        {selectedReportId && (
          <ReportDetailedDialog
            reportId={selectedReportId}
            open={!!selectedReportId}
            onClose={handleCloseDialog}
          />
        )}
      </div>
    </Fragment>
  );
}
