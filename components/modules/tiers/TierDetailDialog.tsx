"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetModules } from "@/services/modules";
import TierModulesList from "@/components/modules/tiers/TierModulesList";
import Link from "next/link";

interface TierData {
  id: string;
  tier: string;
  title: {
    en: string;
    bn?: string;
  };
  description: {
    en: string;
    bn?: string;
  };
  modules: string;
  users: string;
  createdAt: string;
  lastUpdatedAt: string;
}

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
  createdAt: string;
  lastUpdatedAt: string;
}

interface TierDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tierData: TierData | null;
  //   modules: ModuleData[];
}

const getTierColor = (tierLevel: string) => {
  const colorMap: Record<string, string> = {
    TIER_1: "bg-green-100 text-green-800 border-green-300",
    TIER_2: "bg-blue-100 text-blue-800 border-blue-300",
    TIER_3: "bg-purple-100 text-purple-800 border-purple-300",
    TIER_4: "bg-orange-100 text-orange-800 border-orange-300",
    TIER_5: "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[tierLevel] || "bg-gray-100 text-gray-800 border-gray-300";
};

const formatTierDisplay = (tier: string) => {
  return tier.replace("TIER_", "Tier ");
};

const formatDate = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function TierDetailDialog({
  isOpen,
  onClose,
  tierData,
}: TierDetailDialogProps) {
  const { data, isLoading } = useGetModules(tierData?.tier || "");

  if (!tierData) return null;

  // Filter modules for the current tier
  const modules: ModuleData[] = data?.result || [];

  // Check if created and updated dates are the same
  const showUpdatedDate = tierData.createdAt !== tierData.lastUpdatedAt;

  const handleUsersClick = () => {
    // Handle users click - could navigate to users page
    console.log("Navigate to users page for tier:", tierData.tier);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-h-[90vh] min-w-[90vw] p-0 gap-0"
          aria-describedby="tier-detail-dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "font-medium border-none text-lg px-3 py-1",
                  getTierColor(tierData.tier)
                )}
              >
                {formatTierDisplay(tierData.tier)}
              </Badge>
              <span className="text-xl">{tierData.title.en}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 h-[75vh]">
            {/* Left Half - Tier Information */}
            <div className="px-6 py-4 border-gray-100 overflow-y-auto">
              <div className="space-y-8">
                {/* Title Section */}
                <div>
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium">
                      {tierData.title.en}
                    </p>
                    <p className="text-gray-500 text-sm italic font-light tracking-wide">
                      {tierData.title.bn}
                    </p>
                  </div>
                </div>

                {/* Description Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                      {tierData.description.en}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed italic font-light tracking-wide">
                      {tierData.description.bn}
                    </p>
                  </div>
                </div>

                {/* Statistics Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Modules Card - Clickable */}
                    <Link
                      href={{
                        pathname: "/member-programs/training-modules",
                        query: { tier: tierData.tier },
                      }}
                      className={cn({
                        "pointer-events-none opacity-50":
                          tierData.modules === "0",
                      })}
                    >
                      <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all duration-200">
                        <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 group-hover:text-blue-700 transition-colors" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                            Modules
                          </p>
                          <p className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                            {tierData.modules}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200" />
                      </div>
                    </Link>

                    {/* Users Card - Clickable */}
                    <Link
                      href={{
                        pathname: "/users",
                        query: { tier: tierData.tier },
                      }}
                      className={cn({
                        "pointer-events-none opacity-50":
                          tierData.users === "0",
                      })}
                    >
                      <div
                        className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50 hover:shadow-sm transition-all duration-200"
                        onClick={handleUsersClick}
                      >
                        <Users className="h-6 w-6 text-green-600 flex-shrink-0 group-hover:text-green-700 transition-colors" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">
                            Users
                          </p>
                          <p className="font-bold text-xl text-gray-900 group-hover:text-green-700 transition-colors">
                            {tierData.users}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-all duration-200" />
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 min-w-[70px]">
                        Created:
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {formatDate(tierData.createdAt)}
                    </span>
                  </div>
                  {showUpdatedDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 min-w-[70px]">
                        Updated:
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(tierData.lastUpdatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Half - Modules List */}
            <TierModulesList isLoading={isLoading} modules={modules} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
