import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Map } from "lucide-react";

export default function MapSkeleton() {
  return (
    <Card className="shadow-none border-none max-h-fit p-0">
      <CardContent className="p-0 h-[450px]">
        <div className="relative h-full">
          {/* Map container skeleton with texture pattern */}
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-gray-300 relative overflow-hidden">
            {/* Map grid pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>

            {/* Loading indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <Map className="w-12 h-12 text-gray-400 animate-pulse" />
              <p className="text-sm text-gray-500 font-medium">
                Loading map...
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
          </div>

          {/* Floating marker skeletons with map pin icons */}
          <div className="absolute top-4 left-4 flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <Skeleton className="w-6 h-3 rounded" />
          </div>
          <div className="absolute top-12 right-8 flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <Skeleton className="w-8 h-3 rounded" />
          </div>
          <div className="absolute bottom-8 left-1/3 flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <Skeleton className="w-5 h-3 rounded" />
          </div>
          <div className="absolute bottom-16 right-1/4 flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <Skeleton className="w-7 h-3 rounded" />
          </div>

          {/* Map controls skeleton with icons */}
          <div className="absolute top-4 left-4">
            <div className="w-8 h-8 rounded bg-white shadow-sm border border-gray-200 border-b-0 rounded-b-none flex items-center justify-center">
              <span className="text-gray-400 text-sm font-bold">+</span>
            </div>
            <div className="w-8 h-8 rounded bg-white shadow-sm border border-gray-200 border-t rounded-t-none flex items-center justify-center">
              <span className="text-gray-400 text-sm font-bold">-</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
