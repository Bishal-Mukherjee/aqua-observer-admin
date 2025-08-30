"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/useSidebar";
import { useAuth } from "@/store/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();

  const getPageInfo = () => {
    const path = pathname.split("/").pop();

    switch (path) {
      case "home":
        return {
          title: "Dashboard Overview",
          description: "Quick stats and recent activity at a glance",
        };
      case "sighting":
        return {
          title: "Sightings",
          description: "Browse and manage all recorded sightings",
        };
      case "reporting":
        return {
          title: "Reportings",
          description: "Browse and manage all recorded reportings",
        };
      case "users":
        return {
          title: "User Management",
          description: "View, add, or update users in your network",
        };
      case "species":
        return {
          title: "Species Database",
          description: "Explore and edit the list of observed species",
        };
      case "tiers":
        return {
          title: "User Tiers",
          description: "Manage and configure user tiers",
        };
      case "training":
        return {
          title: "Training Modules",
          description: "Manage and configure training modules",
        };
      case "questions":
        return {
          title: "Question Management",
          description: "Manage survey and observation questions",
        };
      case "reports":
        return {
          title: "Analytics & Reports",
          description: "View trends and generate custom reports",
        };
      default:
        return {
          title: "Dashboard",
          description: "Manage your dolphin observation network",
        };
    }
  };

  const { title, description } = getPageInfo();

  return (
    <nav className="w-full h-20 bg-white/60 backdrop-blur-md border-b border-white/20 px-6 flex items-center justify-between">
      {/* Left Section - Page Title */}
      <div className="flex items-center space-x-4">
        <div className={cn("pl-10", { "pl-7": !isCollapsed })}>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md ml-[-36px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-800" />
          <Input
            placeholder="Search sightings, users, species..."
            className="pl-10 bg-white/50 backdrop-blur-sm border focus:bg-white/70 transition-all"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-3">
        {/* Help Button */}
        {/* <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-white/20"
        >
          <HelpCircle className="h-4 w-4 text-gray-600" />
        </Button> */}

        {/* Messages */}
        {/* <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-white/20 relative"
        >
          <MessageSquare className="h-4 w-4 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-green-500 border-2 border-white">
            2
          </Badge>
        </Button> */}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-white/20 relative"
        >
          <Bell className="h-4 w-4 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-200 text-red-500 border-2 border-white">
            5
          </Badge>
        </Button>

        {/* Settings */}
        {/* <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-white/20"
        >
          <Settings className="h-4 w-4 text-gray-600" />
        </Button> */}

        {/* Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-300">
          {/* <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.name.charAt(0)}
          </div> */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-500">{user?.role || "User"}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
