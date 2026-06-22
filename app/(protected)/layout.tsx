"use client";

import { HelmetProvider } from "react-helmet-async";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useSidebar } from "@/store/useSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/useAuth";
import { useGetDistricts } from "@/services/region";
import { useGetSpecies } from "@/services/species";
import { useGetTiers } from "@/services/tiers";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const router = useRouter();

  const { user } = useAuth();
  const { isCollapsed } = useSidebar();

  useGetDistricts();
  useGetSpecies();
  useGetTiers();

  if (!user) return null;

  return (
    <HelmetProvider>
      <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
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
