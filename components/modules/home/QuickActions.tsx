"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, UserPlus, Binoculars } from "lucide-react";

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
          <Link href={"/reports"} className="w-full">
            <Button className="w-full h-16 flex-col space-y-1">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Review Reports</span>
            </Button>
          </Link>
          <Link href={"/users?action=add&role=sighter"} className="w-full">
            <Button
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
            >
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Add Sighter</span>
            </Button>
          </Link>
          {/* <Link href={"/reports"} className="w-full">
            <Button variant="outline" className="w-full h-16 flex-col space-y-1">
              <Download className="h-5 w-5" />
              <span className="text-xs">Export Data</span>
            </Button>
          </Link> */}
          <Link href={"/submissions/sightings"} className="w-full col-span-2">
            <Button
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
            >
              <Binoculars className="h-5 w-5" />
              <span className="text-xs">Sightings</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
