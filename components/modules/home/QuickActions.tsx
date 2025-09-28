"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, UserPlus } from "lucide-react";

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
          <Link href={"/users?action=add&role=sighter"} className="w-full">
            <Button
              variant="outline"
              className="h-16 flex-col space-y-1 w-full"
            >
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Add Sighter</span>
            </Button>
          </Link>
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
