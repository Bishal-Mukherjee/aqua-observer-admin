"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SpeciesGridSkeletonProps {
  count?: number;
}

export default function SpeciesGridSkeleton({
  count = 8,
}: SpeciesGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden border-gray-200 pt-0 shadow-none border-0"
        >
          {/* Card Header Skeleton */}
          <CardHeader className="relative h-48 w-full bg-gray-50 p-0">
            <Skeleton className="w-full h-full" />
            <div className="absolute top-2 right-2">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>

          {/* Card Content Skeleton */}
          <CardContent className="p-3 space-y-3.5 py-0">
            {/* Title and Scientific Name */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>

            {/* Conservation Status */}
            <Skeleton className="h-6 w-24 rounded-full" />

            {/* Habitat */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>

            {/* Identification Features */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-18 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
