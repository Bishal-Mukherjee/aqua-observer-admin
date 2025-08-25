import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="shadow-none border-0">
          <CardContent className="px-4 py-0">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="w-full flex items-center justify-between pr-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20 mt-1" />
                <Skeleton className="h-4 w-16 mt-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
