"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getTierColor } from "@/constants/colorMaps";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  MapPin,
  Briefcase,
  Siren,
  Binoculars,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface UserData {
  id: string;
  name: string;
  phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "SIGHTER" | "SUB_ADMIN";
  tier: string;
  status: "ACTIVE" | "SUSPENDED" | "ONBOARDED";
  age: number;
  email: string | null;
  occupation: string | null;
  createdAt: string;
  lastActiveAt: string;
  reportingsCount: string;
  sightingsCount: string;
}

interface UserDetailedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData | null;
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 border-green-300",
    SUSPENDED: "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
};

const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    SUB_ADMIN: "bg-purple-100 text-purple-800 border-purple-300",
    SIGHTER: "bg-green-100 text-green-800 border-green-300",
  };
  return colorMap[role] || "bg-gray-100 text-gray-800 border-gray-300";
};

const formatTierDisplay = (tier: string) => {
  return tier.replace("TIER_", "Tier ");
};

const formatDate = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (isoString: string) => {
  const dateObj = new Date(isoString);
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (isoString: string) => {
  const now = new Date();
  const date = new Date(isoString);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
};

export default function UserDetailedDialog({
  isOpen,
  onClose,
  userData,
}: UserDetailedDialogProps) {
  const router = useRouter();

  if (!userData) return null;

  const reportingsCount = parseInt(userData.reportingsCount) || 0;
  const sightingsCount = parseInt(userData.sightingsCount) || 0;

  const handleRedirect = (submissionType: string) => {
    router.push(`/users/${submissionType}?id=${userData.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg min-w-2xl max-h-[90vh] px-5"
        aria-describedby="user-details"
      >
        <DialogTitle />
        <ScrollArea className="h-[80vh] pr-0">
          {/* User Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-2xl">
              {userData.name?.charAt(0).toUpperCase() ?? "-"}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userData.name ?? "-"}
              </h3>
              <p className="text-sm text-gray-500">
                {userData.email || "No email provided"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "font-medium border-none",
                  getStatusColor(userData.status),
                )}
              >
                {userData.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "font-medium border-none",
                  getRoleColor(userData.role),
                )}
              >
                {userData.role}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Personal Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Gender</p>
                  {userData.gender ? (
                    <p className="font-medium text-gray-900">
                      {userData.gender.charAt(0) +
                        userData.gender.slice(1).toLowerCase()}
                    </p>
                  ) : (
                    <p className="font-medium text-gray-900">-</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">
                    {userData.age} years old
                  </p>
                </div>
              </div>

              {userData.occupation && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium text-gray-900">
                      {userData.occupation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Contact Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">
                    {userData.phoneNumber}
                  </p>
                </div>
              </div>

              {userData.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">
                      {userData.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Account Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Tier Level</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium border-none",
                      getTierColor(userData.tier),
                    )}
                  >
                    {formatTierDisplay(userData.tier)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(userData.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="font-medium text-gray-900">
                    {getTimeAgo(userData.lastActiveAt)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(userData.lastActiveAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Activity Links */}
          <div className="space-y-3 pb-1">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Activity Overview
            </h4>

            <div className="grid grid-cols-2 gap-2 pr-4">
              {/* Reportings Link */}
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-auto p-4 flex items-center justify-between rounded-lg border transition-all",
                  reportingsCount > 0
                    ? "hover:bg-orange-50 border-orange-200 cursor-pointer"
                    : "cursor-not-allowed opacity-50 border-gray-200",
                )}
                onClick={() => {
                  if (reportingsCount > 0) {
                    handleRedirect("reportings");
                  }
                }}
                disabled={reportingsCount === 0}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Siren className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Reportings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportingsCount}
                    </p>
                  </div>
                </div>
                {reportingsCount > 0 && (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </Button>

              {/* Sightings Link */}
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-auto p-4 flex items-center justify-between rounded-lg border transition-all",
                  sightingsCount > 0
                    ? "hover:bg-blue-50 border-blue-200 cursor-pointer"
                    : "cursor-not-allowed opacity-50 border-gray-200",
                )}
                onClick={() => {
                  if (sightingsCount > 0) {
                    handleRedirect("sightings");
                  }
                }}
                disabled={sightingsCount === 0}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Binoculars className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Sightings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {sightingsCount}
                    </p>
                  </div>
                </div>
                {sightingsCount > 0 && (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
