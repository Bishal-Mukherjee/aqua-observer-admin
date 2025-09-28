import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsCardsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="shadow-none border-0 border-l-4 border-l-gray-200 animate-pulse"
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <div className="p-2 bg-gray-50 rounded-lg">
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </CardHeader>
          <CardContent className="mt-[-8px]">
            <Skeleton className="h-8 w-16 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex items-center space-x-1">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
