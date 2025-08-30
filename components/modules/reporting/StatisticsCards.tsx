import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PawPrint,
  AlertTriangle,
  HeartPulse,
  Skull,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Stats {
  totalAnimals: number;
  stranded: number;
  injured: number;
  dead: number;
}

interface StatisticsCardsProps {
  stats: Stats;
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
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
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">
              +8%
              <span className="text-xs text-muted-foreground">
                &nbsp;observed in reports
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-0 border-l-4 border-l-yellow-500 hover:border-l-yellow-600 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Stranded
          </CardTitle>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.stranded}</div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-red-500">
              -3%&nbsp;
              <span className="text-xs text-muted-foreground">
                animals stranded
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-0 border-l-4 border-l-orange-500 hover:border-l-orange-6001 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Injured
          </CardTitle>
          <div className="p-2 bg-orange-50 rounded-lg">
            <HeartPulse className="h-4 w-4 text-orange-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.injured}</div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">
              +5%&nbsp;
              <span className="text-xs text-muted-foreground">
                animals injured
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-0 border-l-4 border-l-red-500 hover:border-l-red-600 transition-all duration-200 cursor-pointer group">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dead
          </CardTitle>
          <div className="p-2 bg-red-50 rounded-lg">
            <Skull className="h-4 w-4 text-red-600 group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent className="mt-[-8px]">
          <div className="text-2xl font-bold mb-2">{stats.dead}</div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-red-500">
              -2%&nbsp;
              <span className="text-xs text-muted-foreground">
                animals dead
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
