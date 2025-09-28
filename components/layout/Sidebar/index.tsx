"use client";

import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  Home,
  Binoculars,
  Users,
  PawPrint,
  //   BarChart3,
  //   Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Siren,
  ChevronDown,
  ChevronRight,
  Globe,
  ListVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/useSidebar";
import { useAuth } from "@/store/useAuth";
import { APP_NAME } from "@/constants/constants";
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/strings";

// Define types for navData
type NavItem = {
  id: string;
  title: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  subRoutes?: NavItem[];
};

const drawerWidth = 280;

export const navData: NavItem[] = [
  {
    id: "home",
    title: "Home",
    path: "/home",
    icon: Home,
    badge: null,
  },
  {
    id: "submissions",
    title: "Submissions",
    icon: Activity,
    badge: "23",
    subRoutes: [
      {
        id: "reporting",
        title: "Reportings",
        path: "/submissions/reportings",
        icon: Siren,
        // badge: "12",
      },
      {
        id: "sighting",
        title: "Sightings",
        path: "/submissions/sightings",
        icon: Binoculars,
        // badge: "11",
      },
    ],
  },
  {
    id: "member-programs",
    title: "Member Programs",
    icon: Globe,
    badge: null,
    subRoutes: [
      {
        id: "tiers",
        title: "Tiers",
        path: "/member-programs/tiers",
        icon: Users,
        badge: null,
      },
      {
        id: "training-modules",
        title: "Training Modules",
        path: "/member-programs/training-modules",
        icon: ListVideo,
        badge: null,
      },
    ],
  },
  {
    id: "users",
    title: "Users",
    path: "/users",
    icon: Users,
    badge: null,
  },
  {
    id: "species",
    title: "Species",
    path: "/species",
    icon: PawPrint,
    badge: null,
  },
  //   {
  //     id: "questions",
  //     title: "Questions",
  //     path: "/questions",
  //     icon: FileQuestion,
  //     badge: null,
  //   },
  //   {
  //     id: "reports",
  //     title: "Reports",
  //     path: "/reports",
  //     icon: BarChart3,
  //     badge: "5",
  //   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuth();
  const { isCollapsed, setIsCollapsed, activeSubRoute, setActiveSubRoute } =
    useSidebar();

  const toggleRouteExpansion = (id: string) => {
    if (activeSubRoute === id) {
      setActiveSubRoute("");
    } else {
      setActiveSubRoute(id);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div
      className={
        "h-screen bg-white relative border-r-2 border-gray-200 flex flex-col transition-all duration-300 top-0 left-0 z-30"
      }
      style={{ width: isCollapsed ? "78px" : `${drawerWidth}px` }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-6 w-6 p-0 cursor-pointer hover:bg-gray-100 bg-white border absolute top-4 right-[-12px] rounded-full z-20 transition-transform"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed ? "rotate-180" : "rotate-0"
          )}
        />
      </Button>

      {/* Header */}
      <div className="py-4 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <Image
                src="/app-logo.png"
                alt={APP_NAME}
                width={48}
                height={48}
              />
              <div>
                <h2 className="font-bold text-lg text-gray-900">{APP_NAME}</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          ) : (
            <Image src="/app-logo.png" alt={APP_NAME} width={48} height={48} />
          )}
        </div>
      </div>

      {/* User Profile Section */}
      {!isCollapsed ? (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white">
              {user?.name
                ?.split(" ")
                ?.map((n) => n.charAt(0))
                .join("")}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">
                {user?.name || "Guest"}
              </p>
              {user?.phoneNumber && (
                <p className="text-xs text-gray-500">
                  {formatPhoneNumber(user?.phoneNumber)}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-100 flex justify-center">
          <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white">
            {user?.name
              ?.split(" ")
              ?.map((n) => n.charAt(0))
              .join("")}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="h-[calc(96vh-16rem)] p-4">
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Overview
          </p>
        )}

        <div className={cn("space-y-1", { "space-y-2": isCollapsed })}>
          {navData.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              pathname.startsWith(item.path + "/") ||
              pathname.includes(item.id);
            const hasSubRoutes = item.subRoutes && item.subRoutes.length > 0;
            const isExpanded = activeSubRoute === item.id;

            const buttonContent = hasSubRoutes ? (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 text-left transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed ? "px-3" : "px-4"
                )}
                onClick={() => toggleRouteExpansion(item.id)}
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.title}</span>
                    {/* {hasSubRoutes && (
                      <Fragment>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 ml-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-2" />
                        )}
                      </Fragment>
                    )} */}
                  </div>
                )}
              </Button>
            ) : (
              <Link
                href={item.path || "/home"}
                className={cn(
                  "w-full flex items-center justify-start h-12 text-left transition-all duration-200 cursor-pointer rounded-lg text-sm",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed ? "px-3" : "px-4"
                )}
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "ml-auto text-xs",
                          isActive ? "bg-blue-600" : "bg-gray-200 text-gray-600"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            );

            return (
              <div key={item.id} className="space-y-1 relative">
                {isCollapsed && hasSubRoutes ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="p-3 w-[180px] rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-xs">{item.title}</p>
                        <div className="space-y-1 mt-1">
                          {(item.subRoutes as NavItem[]).map((subRoute) => {
                            const SubIcon = subRoute.icon;
                            const isSubActive =
                              pathname === subRoute.path ||
                              pathname.startsWith(subRoute.path || "");

                            return (
                              <Link
                                key={subRoute.id}
                                href={subRoute.path || "/home"}
                                className={cn(
                                  "w-full flex items-center px-2 py-1.5 text-left transition-colors hover:bg-gray-100 group rounded-sm cursor-pointer",
                                  isSubActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600"
                                )}
                              >
                                <div>
                                  <SubIcon
                                    className={cn(
                                      "h-4 w-4 mr-2 text-white/80 group-hover:text-black/80",
                                      { "text-black": isSubActive }
                                    )}
                                  />
                                </div>
                                <div className="flex items-center justify-between w-full">
                                  <span
                                    className={cn(
                                      "text-xs text-white/80 group-hover:text-black/80",
                                      { "text-black": isSubActive }
                                    )}
                                  >
                                    {subRoute.title}
                                  </span>
                                  {subRoute.badge && (
                                    <Badge
                                      variant={
                                        isSubActive ? "default" : "secondary"
                                      }
                                      className={cn(
                                        "ml-2 text-xs",
                                        isSubActive
                                          ? "bg-blue-600"
                                          : "bg-gray-200 text-gray-500"
                                      )}
                                    >
                                      {subRoute.badge}
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <span>{item.title}</span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  buttonContent
                )}

                {/* SubRoutes */}
                {!isCollapsed && hasSubRoutes && isExpanded && (
                  <div className="pl-5 space-y-1">
                    {(item.subRoutes as NavItem[]).map((subRoute) => {
                      const SubIcon = subRoute.icon;
                      const isSubActive =
                        pathname === subRoute.path ||
                        pathname.startsWith(subRoute.path || "");

                      return (
                        <Link
                          href={subRoute.path || "/home"}
                          key={subRoute.id}
                          className={cn(
                            "w-full flex items-center justify-start h-10 text-left transition-all duration-200 cursor-pointer rounded-lg text-sm",
                            isSubActive
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                            "px-3"
                          )}
                        >
                          <div>
                            <SubIcon className="h-4 w-4 mr-2" />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">{subRoute.title}</span>
                            {subRoute.badge && (
                              <Badge
                                variant={isSubActive ? "default" : "secondary"}
                                className={cn(
                                  "ml-auto text-xs",
                                  isSubActive
                                    ? "bg-blue-600"
                                    : "bg-gray-200 text-gray-500"
                                )}
                              >
                                {subRoute.badge}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {/* Bottom Section */}
      <div className="p-4 space-y-2 flex-1 flex flex-col items-end justify-end">
        <Separator />

        {/* {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 text-gray-600 hover:bg-gray-50",
                  "px-3"
                )}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Settings</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-12 text-gray-600 hover:bg-gray-50",
              "px-4"
            )}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </Button>
        )} */}

        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer",
                  "px-3"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Logout</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-12 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer",
              "px-4"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </div>
  );
}
