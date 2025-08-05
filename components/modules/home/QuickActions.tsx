"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Download, BarChart3 } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="shadow-none border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 flex-col space-y-1">
            <FileText className="h-5 w-5" />
            <span className="text-xs">Review Reports</span>
          </Button>
          <Button variant="secondary" className="h-16 flex-col space-y-1">
            <Users className="h-5 w-5" />
            <span className="text-xs">Add Observer</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1">
            <Download className="h-5 w-5" />
            <span className="text-xs">Export Data</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
