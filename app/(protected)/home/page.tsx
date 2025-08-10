"use client";

import GreetingSection from "@/components/modules/home/GreetingSection";
import CarouselSection from "@/components/modules/home/CarouselSection";
import StatsCards from "@/components/modules/home/StatsCards";
import RegionalActivity from "@/components/modules/home/RegionalActivity";
import TopObservers from "@/components/modules/home/TopObservers";
import QuickActions from "@/components/modules/home/QuickActions";
import RecentActivity from "@/components/modules/home/RecentActivity";
import SightingsMap from "@/components/modules/home/SightingMap";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="grid gap-6 lg:grid-cols-10">
        <GreetingSection />
        <CarouselSection />
      </div>
      <StatsCards />
      <div className="grid gap-6 grid-cols-3">
        <RegionalActivity />
        <TopObservers />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SightingsMap />
        <div className="space-y-4">
          <RecentActivity />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
