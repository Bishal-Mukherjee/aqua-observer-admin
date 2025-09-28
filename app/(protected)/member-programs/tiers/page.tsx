"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { useGetTiers } from "@/services/tiers";
import { APP_NAME } from "@/constants/constants";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import TiersTable from "@/components/modules/tiers/TiersTable";

export default function TiersPage() {
  const { data, isLoading } = useGetTiers();

  const tiers = data?.result || [];

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Tiers</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="mb-4">
          <RouteBreadcrumbs />
        </div>
        <TiersTable tiers={tiers} isLoading={isLoading} />
      </div>
    </Fragment>
  );
}
