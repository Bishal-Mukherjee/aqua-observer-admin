"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, Play, Eye, Calendar, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import ModuleDetailedDialog from "@/components/modules/training-modules/ModuleDetailedDialog";

interface ModuleData {
  id: string;
  tier: string;
  title: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  url: string;
  thumbnail: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

function getModuleTypeIcon(type: string) {
  return type === "VR" ? (
    <Eye className="h-4 w-4" />
  ) : (
    <Play className="h-4 w-4" />
  );
}

function getModuleTypeColor(type: string) {
  return type === "VR"
    ? "bg-purple-100 text-purple-800 border-purple-300"
    : "bg-blue-100 text-blue-800 border-blue-300";
}

function formatDate(isoString: string) {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface TierModulesProps {
  isLoading: boolean;
  modules: any[];
  onModuleRemove?: (moduleId: string) => void;
}

// Skeleton loader for module card
function ModuleSkeleton() {
  return (
    <div className="group rounded-lg bg-white border border-gray-100 p-4 flex gap-4 mb-2">
      <div className="flex-shrink-0">
        <Skeleton className="w-20 h-28 rounded-lg flex items-center justify-center">
          <Play className="h-5 w-5 text-gray-300" />
        </Skeleton>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export default function TierModulesList({
  isLoading,
  modules,
  onModuleRemove,
}: TierModulesProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);

  const handleSelect = (params: ModuleData) => {
    setSelectedModule(params);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-br-md border-l h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-gray-600" />
          <h2 className="text-md text-gray-900">
            Training Modules (
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-6 align-middle" />
            ) : (
              modules.length || 0
            )}
            )
          </h2>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-64px)] px-4 py-3 bg-slate-50">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <ModuleSkeleton key={idx} />
            ))}
          </div>
        ) : modules.length > 0 ? (
          <div className="space-y-2">
            {modules.map((module) => (
              <div
                key={module.id}
                className={cn(
                  "group rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white cursor-pointer relative border",
                  { "bg-slate-100": !module.isActive }
                )}
                onClick={() => handleSelect(module)}
              >
                <div className="p-4">
                  <div className="flex gap-4 relative">
                    {/* Module Thumbnail */}
                    <div className="flex-shrink-0 relative">
                      <img
                        src={module.thumbnail}
                        alt={module.title.en}
                        className="w-20 h-28 object-cover rounded-lg border border-gray-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg">
                        <Play className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>

                    {/* Module Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                            {module.title.en}
                          </h4>
                          <p className="text-xs text-gray-500 italic font-light tracking-wide">
                            {module.title.bn}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 line-clamp-2 mb-3 leading-relaxed">
                        {module.description.en}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(module.createdAt)}
                          </span>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "border-none text-xs flex-shrink-0 p-1 px-2",
                            getModuleTypeColor(module.type)
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {getModuleTypeIcon(module.type)}
                            {module.type}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    {/* Deactivate/Delete button */}
                    {onModuleRemove && module.isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="link"
                            className="absolute top-0 right-0 text-red-500 hover:text-red-700 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onModuleRemove(module.id);
                            }}
                          >
                            <X />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Deactivate module</TooltipContent>
                      </Tooltip>
                    )}

                    {!module.isActive && (
                      <Tooltip>
                        <TooltipTrigger className="absolute top-0 right-0 flex items-center gap-1">
                          <Info className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 font-light tracking-wide">
                            Deactivated
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          This module is currently deactivated and <br /> will
                          not be visible to users
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No modules available
            </h3>
            <p className="text-gray-500 text-sm">
              Training modules for this tier will appear here when added
            </p>
          </div>
        )}

        <ScrollBar />
      </ScrollArea>

      {/* Video Player Dialog */}
      <ModuleDetailedDialog
        isOpen={!!selectedModule}
        selectedModule={selectedModule}
        onClose={() => setSelectedModule(null)}
      />
    </div>
  );
}
