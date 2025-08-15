"use client";

import { HelmetProvider } from "react-helmet-async";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useSidebar } from "@/store/useSidebar";
import { cn } from "@/lib/utils";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();
  return (
    <HelmetProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Fixed Sidebar */}
        <div className="fixed top-0 left-0 z-30">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div
          className={cn("flex-1 flex flex-col", {
            "ml-16": isCollapsed,
          })}
        >
          {/* Fixed Navbar */}
          <div
            className={cn("fixed top-0 right-0 left-0 z-20 pl-16", {
              "pl-68": !isCollapsed,
            })}
          >
            <Navbar />
          </div>

          {/* Page Content */}
          <main className={cn("flex-1 pt-16 pl-68", { "pl-4": isCollapsed })}>
            {children}
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}
