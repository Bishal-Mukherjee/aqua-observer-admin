"use client";
import { inter } from "@/theme/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("tracking-tighter antialiased", inter.className)}>
        {children}
      </body>
    </html>
  );
}
