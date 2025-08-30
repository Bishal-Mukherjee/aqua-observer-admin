"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import TiersTable from "@/components/modules/tiers/TiersTable";
import { useGetTiers } from "@/services/tiers";

export default function TiersPage() {
  const { data, isLoading } = useGetTiers();

  const tiers = data?.result || [];

  return (
    <Fragment>
      <Helmet>
        <title>Dashboard | Tiers</title>
      </Helmet>

      <div className="flex-1 space-y-6 px-12 pt-8">
        <TiersTable tiers={tiers} isLoading={isLoading} />
      </div>
    </Fragment>
  );
}
