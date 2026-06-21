"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { useGetRecentActivity } from "@/services/home";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

// replace underscores with spaces, and first letter of each word to uppercase
const formatLocationName = (location?: string) => {
  if (!location) return "";

  return location
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function RecentActivity() {
  const { data, isLoading } = useGetRecentActivity();
  const result = data?.result;

  const buildLocation = (item: {
    district?: string;
    block?: string;
    villageOrGhat?: string;
  }) => {
    return [
      item.villageOrGhat,
      formatLocationName(item.block),
      formatLocationName(item.district),
    ]
      .filter(Boolean)
      .join(", ");
  };

  const activities = result
    ? [
        result.latestReporting
          ? {
              key: "reporting",
              title: `Latest reporting in ${buildLocation(result.latestReporting)}`,
              date: result.latestReporting.submittedAt,
              timestamp: dayjs(result.latestReporting.submittedAt).fromNow(),
              reporter: result.latestReporting.submittedBy ?? "Unknown",
              status: result.latestReporting.isValid ? "Verified" : "Pending",
              href: null,
            }
          : null,
        result.latestSighting
          ? {
              key: "sighting",
              title: `Latest sighting in ${buildLocation(result.latestSighting)}`,
              date: result.latestSighting.submittedAt,
              timestamp: dayjs(result.latestSighting.submittedAt).fromNow(),
              reporter: result.latestSighting.submittedBy ?? "Unknown",
              status: result.latestSighting.isValid ? "Verified" : "Pending",
              href: null,
            }
          : null,
        result.latestSighter
          ? {
              key: "sighter",
              title: "New observer registered",
              date: result.latestSighter.createdAt,
              timestamp: dayjs(result.latestSighter.createdAt).fromNow(),
              reporter: `${result.latestSighter.name} joined`,
              status: "New Member",
              href: null,
            }
          : null,
        result.latestReport
          ? {
              key: "report",
              title: result.latestReport.description || "Report generated",
              date: result.latestReport.createdAt,
              timestamp: dayjs(result.latestReport.createdAt).fromNow(),
              reporter: result.latestReport.createdBy ?? "System automated",
              status: "Report",
              href: result.latestReport.reportUrl,
            }
          : null,
      ]
        .filter(Boolean)
        .sort((a, b) => dayjs(b!.date).valueOf() - dayjs(a!.date).valueOf())
    : [];

  const handleClick = (href: string | null) => {
    if (href) {
      window.open(href, "_blank", "noopener noreferrer");
    }
  };

  return (
    <Card className="shadow-none border-0 h-90">
      <CardHeader className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-400" />
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pl-6">
        {isLoading ? (
          <div className="space-y-4 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {activities.map((activity) => (
              <div
                key={activity!.key}
                className={cn(
                  "flex items-start space-x-4 p-2 rounded-md",
                  activity!.href ? "cursor-pointer hover:bg-slate-100" : "",
                )}
                onClick={() => handleClick(activity!.href)}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity!.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity!.reporter} • {activity!.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
