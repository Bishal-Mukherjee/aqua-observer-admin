import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PawPrint,
  ListOrdered,
  AlertTriangle,
  Star,
  //   Layers,
  //   TrendingUp,
  //   TrendingDown,
} from "lucide-react";

// Helper to calculate stats from sightings data
function calculateSightingsStats(data: any[]) {
  let totalAnimals = 0;
  let totalSightings = data.length;
  let threatsReported = 0;
  const speciesSet = new Set<string>();

  data.forEach((sighting) => {
    sighting.species.forEach((sp: any) => {
      const count =
        (sp.adult || 0) +
        (sp.adultMale || 0) +
        (sp.adultFemale || 0) +
        (sp.subAdult || 0);
      totalAnimals += count;
      speciesSet.add(sp.type);
    });

    if (sighting.threats && sighting.threats.length > 0) {
      threatsReported += 1;
    }
  });

  return {
    totalAnimals,
    totalSightings,
    threatsReported,
    uniqueSpecies: speciesSet.size,
  };
}

interface StatisticsCardsProps {
  data: any[];
}

export default function StatisticsCards({ data }: StatisticsCardsProps) {
  const stats = useMemo(() => calculateSightingsStats(data), [data]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-none border-0 border-l-4 border-l-green-500 hover:border-l-green-600 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Animals
          </CardTitle>
          <div className="p-2 bg-green-50 rounded-lg">
            <PawPrint className="h-4 w-4 text-green-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.totalAnimals}</div>
          {/* <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">
              +8%
              <span className="text-xs text-muted-foreground">
                &nbsp;observed in sightings
              </span>
            </span>
          </div> */}
        </CardContent>
      </Card>

      <Card className="shadow-none border-0 border-l-4 border-l-blue-500 hover:border-l-blue-600 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sightings
          </CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
            <ListOrdered className="h-4 w-4 text-blue-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.totalSightings}</div>
          {/* <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-blue-500">
              +4%
              <span className="text-xs text-muted-foreground">
                &nbsp;new records
              </span>
            </span>
          </div> */}
        </CardContent>
      </Card>

      <Card className="shadow-none border-0 border-l-4 border-l-yellow-500 hover:border-l-yellow-600 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Threats Reported
          </CardTitle>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.threatsReported}</div>
          {/* <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-500">
              -1%
              <span className="text-xs text-muted-foreground">
                &nbsp;with threats
              </span>
            </span>
          </div> */}
        </CardContent>
      </Card>

      <Card className="shadow-none border-0 border-l-4 border-l-purple-500 hover:border-l-purple-600 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unique Species
          </CardTitle>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Star className="h-4 w-4 text-purple-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.uniqueSpecies}</div>
          {/* <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-purple-500">
              +2%
              <span className="text-xs text-muted-foreground">
                &nbsp;species observed
              </span>
            </span>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
