"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Binoculars,
  Siren,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetHomeStats } from "@/services/home";

interface StatData {
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  changeText: string;
}

interface StatsResponse {
  message: string;
  result: {
    totalSightings: StatData;
    activeObservers: StatData;
    totalReportings: StatData;
  };
}

export default function StatsCards() {
  const { data, isLoading, error } = useGetHomeStats();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="shadow-none border-0 border-l-4 border-l-blue-500"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              </div>
            </CardHeader>
            <CardContent className="mt-[-4px]">
              <div className="text-2xl font-bold mb-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <Card className="shadow-none border-0 border-l-4 border-l-red-500 col-span-3">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Failed to load statistics. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData: StatsResponse = data;

  const statsConfig = [
    {
      title: "Total Sightings",
      key: "totalSightings" as keyof typeof statsData.result,
      icon: Binoculars,
    },
    {
      title: "Active Observers",
      key: "activeObservers" as keyof typeof statsData.result,
      icon: Users,
    },
    {
      title: "Total Reportings",
      key: "totalReportings" as keyof typeof statsData.result,
      icon: Siren,
    },
  ];

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}%`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
      {statsConfig.map((config, index) => {
        const stat = statsData.result[config.key];
        const Icon = config.icon;
        const isPositive = stat.changeType === "increase";

        return (
          <Card
            key={index}
            className="shadow-none border-0 border-l-4 border-l-blue-500"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {config.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.changeText}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="mt-[-4px]">
              <div className="text-2xl font-bold mb-2">
                {formatNumber(stat.value)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      isPositive ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {formatChange(stat.change)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
