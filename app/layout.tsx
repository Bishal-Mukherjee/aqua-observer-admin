"use client";
// import { inter } from "@/theme/fonts";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`tracking-tighter antialiased`}>{children}</body>
    </html>
  );
}
