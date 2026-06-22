"use client";

import Link from "next/link";
import { Binoculars, Siren, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetTopSpecies, type TopSpeciesEntry } from "@/services/home";

type CardConfig = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  submissionType: "sightings" | "reportings";
  entries: TopSpeciesEntry[];
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "bg-blue-600 text-white"
      : rank === 2
        ? "bg-blue-400 text-white"
        : "bg-blue-200 text-blue-800";

  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        colors,
      )}
    >
      {rank}
    </span>
  );
}

function SpeciesRow({
  entry,
  rank,
  submissionType,
}: {
  entry: TopSpeciesEntry;
  rank: number;
  submissionType: "sightings" | "reportings";
}) {
  const href = `/species/${submissionType}?species=${encodeURIComponent(
    entry.species,
  )}`;
  const actionLabel =
    submissionType === "sightings"
      ? `View all ${entry.label.en} sightings`
      : `View all ${entry.label.en} reportings`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 group"
    >
      <RankBadge rank={rank} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {entry.label.en}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(entry.submissionCount)} submissions ·{" "}
          {entry.sharePercent}% of total
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold text-gray-900">
          {formatNumber(entry.individualCount)}
        </span>
        <ArrowRight className="h-4 w-4 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}

function TopSpeciesCard({ config }: { config: CardConfig }) {
  const Icon = config.icon;

  return (
    <Card className={cn("shadow-none border-0 border-l-4", config.borderColor)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
        <div className="rounded-lg bg-blue-50 p-2">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 px-3">
        {config.entries.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        ) : (
          config.entries.map((entry, index) => (
            <SpeciesRow
              key={entry.species}
              entry={entry}
              rank={index + 1}
              submissionType={config.submissionType}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="shadow-none border-0 border-l-4 border-l-blue-500"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TopSpeciesCards() {
  const { data, isLoading, error } = useGetTopSpecies();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <Card className="shadow-none border-0 border-l-4 border-l-red-500 col-span-3">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Failed to load top species data. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = data?.result;

  const cards: CardConfig[] = [
    {
      title: "Top Species - Sightings",
      icon: Binoculars,
      borderColor: "border-l-blue-500",
      submissionType: "sightings",
      entries: result?.sightings || [],
    },
    {
      title: "Top Species - Reportings",
      icon: Siren,
      borderColor: "border-l-blue-500",
      submissionType: "reportings",
      entries: result?.reportings || [],
    },
    {
      title: "Top Species - Dead / Injured",
      icon: AlertTriangle,
      borderColor: "border-l-orange-500",
      submissionType: "reportings",
      entries: result?.deadInjured || [],
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
      {cards.map((config) => (
        <TopSpeciesCard key={config.title} config={config} />
      ))}
    </div>
  );
}
