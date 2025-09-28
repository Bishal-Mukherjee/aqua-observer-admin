import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "lucide-react";

export default function PieChartSkeleton() {
  return (
    <Card className="shadow-none border-none max-h-fit p-0">
      <CardHeader className="p-0">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Pie chart container skeleton */}
          <div className="w-full h-80 rounded-lg bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-dashed border-gray-300 relative overflow-hidden flex items-center justify-center">
            {/* Loading indicator */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <PieChart className="w-12 h-12 text-gray-400 animate-pulse" />
              <p className="text-sm text-gray-500 font-medium">
                Loading chart...
              </p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>

            {/* Simulated pie slices */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                {/* Animated pie slices */}
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-gray-200 animate-spin"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-r-gray-400 animate-pulse"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-b-gray-300 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-l-gray-200 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Legend skeleton */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
