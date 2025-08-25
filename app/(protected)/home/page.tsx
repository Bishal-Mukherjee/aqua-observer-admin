"use client";

import { Fragment } from "react";
import dynamic from "next/dynamic";
import { Helmet } from "react-helmet-async";

import GreetingSection from "@/components/modules/home/GreetingSection";
import CarouselSection from "@/components/modules/home/CarouselSection";
import StatsCards from "@/components/modules/home/StatsCards";
import DistributionOverviewDonut from "@/components/modules/home/DistributionOverviewDonut";
import DistrictMonthlyStackedBar from "@/components/modules/home/DistrictMonthlyStackedBar";
import QuickActions from "@/components/modules/home/QuickActions";
import RecentActivity from "@/components/modules/home/RecentActivity";
const SightingsMap = dynamic(
  () => import("@/components/modules/home/SightingMap"),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <Fragment>
      <Helmet>
        <title>Dashboard | Home</title>
        <meta
          name="description"
          content="Overview of key metrics and recent activity"
        />
      </Helmet>
      <div className="flex-1 space-y-6 px-12 py-8">
        <div className="grid gap-6 lg:grid-cols-10">
          <GreetingSection />
          <CarouselSection />
        </div>
        <StatsCards />
        <div className="grid gap-6 grid-cols-3">
          <DistributionOverviewDonut />
          <DistrictMonthlyStackedBar />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SightingsMap />
          <div className="space-y-4">
            <RecentActivity />
            <QuickActions />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
