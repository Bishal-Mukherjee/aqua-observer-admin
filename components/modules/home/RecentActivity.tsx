"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const activities = [
  {
    title: "Pod of 6 dolphins spotted in Marina Bay",
    timestamp: "5 minutes ago",
    reporter: "Lui Thomas",
    status: "Verified",
  },
  {
    title: "New observer registration approved",
    timestamp: "1 hour ago",
    reporter: "Emma Wilson joined",
    status: "New Member",
  },
  {
    title: "Weekly summary report generated",
    timestamp: "3 hours ago",
    reporter: "System automated",
    status: "Report",
  },
];

export default function RecentActivity() {
  return (
    <Card className="shadow-none border-0 h-90">
      <CardHeader className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-400" />
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.reporter} • {activity.timestamp}
                </p>
                <Badge variant="outline" className="text-xs">
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
