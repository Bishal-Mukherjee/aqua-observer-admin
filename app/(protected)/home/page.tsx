"use client";

import React, { Fragment } from "react";
import dynamic from "next/dynamic";
import { Helmet } from "react-helmet-async";
import { MapPinned } from "lucide-react";
import { useGetSpecies } from "@/services/species";
import { useGetOverviewLocations } from "@/services/home";
import GreetingSection from "@/components/modules/home/GreetingSection";
import CarouselSection from "@/components/modules/home/CarouselSection";
import StatsCards from "@/components/modules/home/StatsCards";
import DistributionOverviewDonut from "@/components/modules/home/DistributionOverviewDonut";
import DistrictMonthlyStackedBar from "@/components/modules/home/DistrictMonthlyStackedBar";
import QuickActions from "@/components/modules/home/QuickActions";
import RecentActivity from "@/components/modules/home/RecentActivity";
import { APP_NAME } from "@/constants/constants";
import SubmissionDialog from "@/components/common/SubmissionDialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InteractiveMap = dynamic(
  () => import("@/components/common/InteractiveMap"),
  { ssr: false }
);

const SUBMISSION_TYPES = [
  { value: "reportings", label: "Reportings" },
  { value: "sightings", label: "Sightings" },
];

export default function DashboardPage() {
  const { data } = useGetSpecies();
  const [selectedType, setSelectedType] = React.useState("reportings");
  const { data: overviewLocations, isLoading } = useGetOverviewLocations(
    selectedType,
    50
  );

  const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null);
  const currentType = selectedType === "reportings" ? "REPORTING" : "SIGHTING";

  const handleSelect = (location: string) => {
    setSelectedSubmission(location);
  };

  const handleOnChange = (value: string) => {
    setSelectedType(value);
    setSelectedSubmission(null);
  };

  return (
    <Fragment>
      <Helmet>
        <title>{APP_NAME} | Home</title>
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
          <Card className="shadow-none border-none">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-slate-400" />
                <p className="text-md font-semibold capitalize pt-1">{`${selectedType} Locations`}</p>
              </div>
              <Select onValueChange={handleOnChange} defaultValue="reportings">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {SUBMISSION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-full">
              <InteractiveMap
                isLoading={isLoading}
                title={`${currentType} Locations`}
                data={overviewLocations?.result?.data || []}
                onLocationSelect={handleSelect}
              />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <RecentActivity />
            <QuickActions />
          </div>
        </div>
      </div>
      <SubmissionDialog
        submissionId={selectedSubmission}
        speciesData={data?.result || []}
        onClose={() => setSelectedSubmission(null)}
        type={currentType}
      />
    </Fragment>
  );
}
