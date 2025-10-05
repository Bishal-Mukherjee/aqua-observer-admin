"use client";

// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { toast } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useSidebar } from "@/store/useSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/useAuth";
import { useGetDistricts } from "@/services/region";
import { useGetSpecies } from "@/services/species";
import { useGetTiers } from "@/services/tiers";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

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

  //   useEffect(() => {
  //     if (user) {
  //       router.push("/home");
  //     } else {
  //       router.push("/login");
  //     }
  //   }, [user]);

  //   useEffect(() => {
  //     const subscription = supabase
  //       .channel("reportings")
  //       .on(
  //         "postgres_changes",
  //         { event: "*", schema: "public", table: "reportings" },
  //         (payload) => {
  //           toast.warning("New reporting alert received. Click to view.", {
  //             action: {
  //               label: "View",
  //               onClick: () => {
  //                 console.log(payload.new);
  //                 // payload.new
  //                 // Add navigation or modal logic here if desired
  //               },
  //             },
  //           });
  //         }
  //       )
  //       .subscribe();

  //     return () => {
  //       supabase.removeChannel(subscription);
  //     };
  //   }, []);

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
