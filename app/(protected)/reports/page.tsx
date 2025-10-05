"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "@/constants/constants";
import CreateReportDialog from "@/components/modules/reports/CreateReportDialog";
import { redirect } from "next/navigation";

export default function ReportsPage() {
  redirect("/home"); // TODO: Enable reports feature

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Reports</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl text-gray-900">Reports</h1>
          <CreateReportDialog />
        </div>
      </div>
    </Fragment>
  );
}
