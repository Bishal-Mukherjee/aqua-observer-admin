"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Bird, Fish, Worm } from "lucide-react";
import StatisticsCardsSkeleton from "@/components/modules/species/LoadingSkeletons/StatisticsCardsSkeleton";
import { cn } from "@/lib/utils";

interface StatisticsCardsProps {
  speciesCount: number;
  birdCount: number;
  mammalCount: number;
  reptileCount: number;
  selectedCategory?: string;
  onCardClick: (category: string) => void;
  isLoading?: boolean;
}

export default function StatisticsCards({
  speciesCount,
  birdCount,
  mammalCount,
  reptileCount,
  selectedCategory,
  onCardClick,
  isLoading,
}: StatisticsCardsProps) {
  if (isLoading) return <StatisticsCardsSkeleton />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card
        className="shadow-none border border-white cursor-pointer transition-transform duration-200 hover:scale-101"
        onClick={() => onCardClick("")}
        role="button"
      >
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="w-full flex items-center justify-between pr-2">
                <div className="text-2xl font-bold">{speciesCount}</div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Species</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card
        className={cn(
          "shadow-none border border-white cursor-pointer transition-transform duration-200 hover:scale-101",
          { "border-sky-400": selectedCategory === "BIRD" }
        )}
        onClick={() => onCardClick("BIRD")}
        role="button"
      >
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="w-full flex items-center justify-between pr-2">
                <div className="text-2xl font-bold">{birdCount}</div>
                <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Bird className="h-5 w-5 text-sky-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Birds</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card
        className={cn(
          "shadow-none border border-white cursor-pointer transition-transform duration-200 hover:scale-101",
          { "border-purple-400": selectedCategory === "MAMMAL" }
        )}
        onClick={() => onCardClick("MAMMAL")}
        role="button"
      >
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="w-full flex items-center justify-between">
                <div className="text-2xl font-bold">{mammalCount}</div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Fish className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Mammals</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card
        className={cn(
          "shadow-none border border-white cursor-pointer transition-transform duration-200 hover:scale-101",
          { "border-emerald-400": selectedCategory === "REPTILE" }
        )}
        onClick={() => onCardClick("REPTILE")}
        role="button"
      >
        <CardContent className="p-4 py-0">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{reptileCount}</div>
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Worm className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Reptiles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
