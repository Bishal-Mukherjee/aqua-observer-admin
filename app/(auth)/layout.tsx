"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelmetProvider } from "react-helmet-async";
import { useAuth } from "@/store/useAuth";

export default function UnauthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user]);

  return (
    <HelmetProvider>
      <main
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </main>
    </HelmetProvider>
  );
}
