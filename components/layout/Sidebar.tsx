"use client";

import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Home,
  Binoculars,
  Users,
  PawPrint,
  FileQuestion,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Siren,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/useSidebar";

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
        path: "/submissions/reporting",
        icon: Siren,
        badge: "12",
      },
      {
        id: "sighting",
        title: "Sightings",
        path: "/submissions/sighting",
        icon: Binoculars,
        badge: "11",
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
  {
    id: "questions",
    title: "Questions",
    path: "/questions",
    icon: FileQuestion,
    badge: null,
  },
  {
    id: "reports",
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    badge: "5",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed, activeSubRoute, setActiveSubRoute } =
    useSidebar();

  const toggleRouteExpansion = (id: string) => {
    setActiveSubRoute(id);
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      router.push(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/auth/login");
  };

  return (
    <div
      className={cn(
        "h-screen bg-white relative border-r border-gray-200 flex flex-col transition-all duration-300 top-0 left-0 z-30",
        isCollapsed ? "w-24" : `w-[${drawerWidth}px]`
      )}
      style={{ width: isCollapsed ? "72px" : `${drawerWidth}px` }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-6 w-6 p-0 hover:bg-gray-100 bg-white border absolute top-4 right-[-12px] rounded-full z-20 transition-transform"
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  AquaObserver
                </h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          ) : (
            <div className="w-16 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">Jenny Martin</p>
              <p className="text-xs text-gray-500">admin@aquaobserver.com</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Overview
          </p>
        )}

        {navData.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const hasSubRoutes = item.subRoutes && item.subRoutes.length > 0;
          const isExpanded = activeSubRoute === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 text-left transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed ? "px-3" : "px-4"
                )}
                onClick={() =>
                  hasSubRoutes
                    ? toggleRouteExpansion(item.id)
                    : handleNavigation(item.path)
                }
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{item.title}</span>
                    {hasSubRoutes && (
                      <Fragment>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 ml-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 ml-2" />
                        )}
                      </Fragment>
                    )}
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
              </Button>

              {/* SubRoutes */}
              {!isCollapsed && hasSubRoutes && isExpanded && (
                <div className="pl-5 space-y-1">
                  {(item.subRoutes as NavItem[]).map((subRoute) => {
                    const SubIcon = subRoute.icon;
                    const isSubActive =
                      pathname === subRoute.path ||
                      pathname.startsWith(subRoute.path || "");

                    return (
                      <Button
                        key={subRoute.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-10 text-left transition-all duration-200 cursor-pointer",
                          isSubActive
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                          "px-3"
                        )}
                        onClick={() => handleNavigation(subRoute.path)}
                      >
                        <SubIcon className="h-4 w-4 mr-2" />
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
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Bottom Section */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-12 text-gray-600 hover:bg-gray-50",
            isCollapsed ? "px-3" : "px-4"
          )}
        >
          <Settings className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span>Settings</span>}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-12 text-red-600 hover:bg-red-50 hover:text-red-700",
            isCollapsed ? "px-3" : "px-4"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
