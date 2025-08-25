"use client";

import React, { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import reportingData from "./data.json";
import StatisticsCards from "@/components/modules/reporting/StatisticsCards";
import ReportingTable from "@/components/modules/reporting/ReportingTable";
import ReportingCharts from "@/components/modules/reporting/ReportingCharts";
import { calculateStats } from "@/components/modules/reporting/calculateStats";

const LIVE_REPORTING = "LIVE_REPORTING",
  OLD_REPORTING = "OLD_REPORTING";

export default function SubmissionReportingPage() {
  const [tab, setTab] = useState(LIVE_REPORTING);

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const data = useMemo(
    () => reportingData.reporting.filter((item) => item.type === tab),
    [tab]
  );

  const countObj = useMemo(
    () => ({
      live: reportingData.reporting.filter(
        (item) => item.type === LIVE_REPORTING
      ).length,
      old: reportingData.reporting.filter((item) => item.type === OLD_REPORTING)
        .length,
    }),
    []
  );

  const stats = useMemo(() => calculateStats(data), [data]);

  return (
    <Fragment>
      <Helmet>
        <title>Dashboard | Reportings</title>
      </Helmet>

      <div className="py-8 px-12 flex-1 bg-gray-50">
        <Tabs
          defaultValue={LIVE_REPORTING}
          value={tab}
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger
              value={LIVE_REPORTING}
              className="text-xs text-slate-700 cursor-pointer"
            >
              Live Reportings ({countObj.live || 0})
            </TabsTrigger>
            <TabsTrigger
              value={OLD_REPORTING}
              className="text-xs text-slate-700 cursor-pointer"
            >
              Old Reportings ({countObj.old || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={LIVE_REPORTING} className="mt-2">
            <div className="flex-1">
              <StatisticsCards stats={stats} />
              <ReportingCharts data={data} />
              <div className="mt-4">
                <ReportingTable entries={data} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value={OLD_REPORTING} className="mt-2">
            <div className="flex-1">
              <StatisticsCards stats={stats} />
              <ReportingCharts data={data} />
              <div className="mt-4">
                <ReportingTable entries={data} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Fragment>
  );
}
