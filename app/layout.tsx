"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { inter } from "@/theme/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("tracking-tighter antialiased", inter.className)}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
