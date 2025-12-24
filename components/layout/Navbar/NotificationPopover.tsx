import React, { useState, useCallback, useEffect } from "react";
import { Bell, Siren, X, Loader2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatNotificationContent } from "@/lib/strings";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import { useNotificationPagination } from "@/store/pagination/useNotificationPagination";

dayjs.extend(relativeTime);

interface NotificationPopoverProps {
  totalNotifications?: number;
  notifications: any[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
  handleLoadMore: () => void;
}

const formatTimeAgo = (date: Date) => {
  return dayjs(date).fromNow();
};

const getPriority = (submissionType: string) => {
  switch (submissionType) {
    case "LIVE_REPORTING":
      return "high";
    case "OLD_REPORTING":
      return "medium";
    case "LIVE_SIGHTING":
    case "OLD_SIGHTING":
      return "low";
    default:
      return "low";
  }
};

const getPriorityBadgeStyle = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-500";
    case "medium":
      return "bg-amber-50 text-amber-500";
    case "low":
      return "bg-blue-50 text-blue-500";
    default:
      return "bg-gray-50 text-gray-500";
  }
};

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  totalNotifications = 0,
  notifications,
  onSelect,
  isLoading = false,
  handleLoadMore,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, totalPages } = useNotificationPagination();

  const hasMore = currentPage < totalPages;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 max-w-7 p-0 px-2 text-xs bg-red-200 text-red-500 border-2 border-white">
            {totalNotifications}
          </Badge>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 h-[570px] p-0 flex flex-col"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg text-gray-900">Notifications</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1">
          {notifications.length === 0 && !isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <Bell size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[508px] divide-y divide-gray-100">
              {notifications.map((notification) => {
                const priority = getPriority(notification.submissionType);
                return (
                  <div
                    key={notification.id}
                    className="p-4 transition-colors cursor-pointer group border-l hover:bg-gray-50 hover:border-blue-500"
                    onClick={() => onSelect(notification.id)}
                    role="button"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 p-2 rounded-full bg-gray-100 text-red-600 transition-transform duration-200 group-hover:scale-110 flex items-center",
                          {
                            "text-amber-600":
                              notification.submissionType === "OLD_REPORTING",
                            "text-blue-600":
                              notification.submissionType === "LIVE_SIGHTING",
                            "text-violet-600":
                              notification.submissionType === "OLD_SIGHTING",
                          }
                        )}
                      >
                        <Siren className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification?.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium border-none",
                              getPriorityBadgeStyle(priority)
                            )}
                          >
                            {priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatNotificationContent(notification?.content)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {hasMore && (
                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="w-full h-auto cursor-pointer py-1 text-blue-600 hover:text-gray-900 hover:bg-white/80 transition-all duration-200 border-none rounded-lg group"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">Load More</span>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                      </div>
                    )}
                  </Button>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && notifications.length > 0 && (
                <div className="p-4 text-center border-t border-gray-100 bg-gray-50/30">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                    <span className="text-xs text-gray-400 px-3 py-1 bg-white rounded-full border border-gray-200">
                      You've reached the end
                    </span>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                  </div>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
