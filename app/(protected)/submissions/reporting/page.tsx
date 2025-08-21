"use client";

import React, { Fragment, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import reportingData from "./data.json";
import StatisticsCards from "@/components/modules/reporting/StatisticsCards";
import ReportingTable from "@/components/modules/reporting/ReportingTable";
import { calculateStats } from "@/components/modules/reporting/calculateStats";
// import DistributionPieChart from "@/components/modules/reporting/DistributionPieChart";
// import MonthlyTrendsChart from "@/components/modules/reporting/MonthlyTrendsChart";

export default function SubmissionReportingPage() {
  const data = reportingData.reporting;

  const stats = useMemo(() => calculateStats(data), [data]);

  return (
    <Fragment>
      <Helmet>
        <title>Dashboard | Reporting</title>
      </Helmet>

      <div className="py-8 px-12 flex-1 bg-gray-50">
        <StatisticsCards stats={stats} />
        <div className="mt-8">
          <ReportingTable entries={data} />
        </div>
        {/* <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="col-span-2">
            <DistributionPieChart data={data} />
          </div>
          <div className="col-span-3">
            <MonthlyTrendsChart data={data} />
          </div>
        </div> */}
      </div>
    </Fragment>
  );
}
