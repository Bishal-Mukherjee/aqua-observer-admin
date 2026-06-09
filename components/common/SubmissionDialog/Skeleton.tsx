"use client";

import React, { Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  User,
  MapPinIcon,
  PawPrint,
  Image as ImageIcon,
  Building2,
  Home,
} from "lucide-react";

export default function DetailedDialogSkeleton() {
  return (
    <ScrollArea className="h-[75vh] p-4">
      {/* Date and Time Section */}
      <Card className="border-none shadow-none mb-4">
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-1">
          <MapPinIcon className="h-5 w-5 text-gray-500" />
          Location Details
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <Card className="border-none shadow-none">
            <CardContent className="px-4 py-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                    <Home className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center">
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Species Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-gray-500" />
            Species Observations
          </h3>
          <Skeleton className="w-6 h-6 rounded-xl" />
        </div>

        <div className="space-y-2">
          {/* Species Item 1 */}
          <Card className="border-none shadow-none">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-7 w-40" />
              </div>
              <div className="grid grid-cols-3 gap-6 pt-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="text-center">
                    <Skeleton className="h-4 w-20 mx-auto mb-2" />
                    <div className="space-y-0.5">
                      <Skeleton className="h-5 w-16 mx-auto" />
                      <Skeleton className="h-5 w-14 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Species Item 2 */}
          <Card className="border-none shadow-none">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-7 w-36" />
              </div>
              <div className="grid grid-cols-3 gap-6 pt-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="text-center">
                    <Skeleton className="h-4 w-20 mx-auto mb-2" />
                    <div className="space-y-0.5">
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Images Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-500" />
            Images
          </h3>
          <Skeleton className="w-6 h-6 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((item) => (
            <Skeleton key={item} className="aspect-video rounded-lg" />
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Reporter Information */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          Reporter Information
        </h3>

        <div className="flex items-start justify-between pr-4">
          <div className="flex items-center gap-4">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

/* Map Section */
export function MapSkeleton() {
  return (
    <div className="w-1/2 border-l border-gray-200">
      <div className="h-full">
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading map...</div>
        </div>
      </div>
    </div>
  );
}
