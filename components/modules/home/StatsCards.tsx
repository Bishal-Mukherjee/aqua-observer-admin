"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Total Sightings",
    value: "1,247",
    change: "+12%",
    changeType: "positive",
    icon: Eye,
    description: "from last month",
  },
  {
    title: "Active Observers",
    value: "89",
    change: "+5%",
    changeType: "positive",
    icon: Users,
    description: "from last month",
  },
  {
    title: "Pending Reports",
    value: "23",
    change: "-8%",
    changeType: "negative",
    icon: FileText,
    description: "from last month",
  },
  {
    title: "Species Identified",
    value: "15",
    change: "+2",
    changeType: "positive",
    icon: Search,
    description: "new this month",
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-none border-0 border-l-4 border-l-blue-500"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="mt-[-4px]">
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      stat.changeType === "positive" && "text-green-500",
                      stat.changeType === "negative" && "text-red-500"
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
