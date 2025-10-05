"use client";

import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "@/constants/constants";
import RouteBreadcrumbs from "@/components/layout/RouteBreadcrumbs";
import TiersTable from "@/components/modules/tiers/TiersTable";
import { useTiersStore } from "@/store/useTiers";

export default function TiersPage() {
  const { tiers } = useTiersStore();

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Tiers</title>
      </Helmet>

      <div className="py-10 px-12 flex-1 bg-gray-50">
        <div className="mb-4">
          <RouteBreadcrumbs />
        </div>
        <TiersTable tiers={tiers} />
      </div>
    </Fragment>
  );
}
