"use client";

import Image from "next/image";
import Link from "next/link";
import { Helmet } from "react-helmet-async";
import { Download, LogIn, Users, BarChart3, Database } from "lucide-react";
import { APP_NAME } from "@/constants/constants";
import { Button } from "@/components/ui/button";

export default function Home() {
  const handleDownload = () => {
    const link = document.createElement("a");
    //   link.href =
    //     "https://rudratracker-storage.s3.ap-south-1.amazonaws.com/rudra-app.apk";
    link.href =
      "https://txzuyrbzkwatgdlurvgp.supabase.co/storage/v1/object/public/aqua-observer-bucket/packages/rudra-app.apk";
    link.download = "rudra.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>{APP_NAME} - Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-3 pb-6 px-1">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/app-logo.png"
                alt={APP_NAME}
                width={180}
                height={180}
                className="object-contain"
              />
            </div>
          </div>

          <div className="text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-gray-600 leading-relaxed">
                A comprehensive administrative solution for monitoring and
                managing aquatic species data across West Bengal's diverse river
                systems and coastal environments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
              {/* <Button
                variant="outline"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download RUDRA App
              </Button> */}

              <Link href="/login">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Dashboard Login
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 pb-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Data Analytics
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Comprehensive reporting and visualization tools for species
                  distribution and conservation metrics.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Observer Network
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Manage field researchers and community observers with
                  role-based access controls.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Species Database
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Centralized repository for aquatic species information and
                  ecological data.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Supporting conservation research and biodiversity monitoring
              initiatives across freshwater and marine ecosystems.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
