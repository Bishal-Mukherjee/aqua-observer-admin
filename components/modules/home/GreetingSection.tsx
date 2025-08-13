"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export default function GreetingSection() {
  return (
    <Card className="lg:col-span-7 border-0 shadow-none relative overflow-hidden h-62">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&q=80')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <CardContent className="relative z-10 p-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-white">🌊 Hi! Admin</h1>
            <p className="text-white/90 text-lg max-w-md">
              Monitoring the rich biodiversity of West Bengal's rivers and
              coastal regions.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Calendar className="h-3 w-3 mr-1" />
                Last sync: Today, 2:30 PM
              </Badge>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="space-y-2">
              <div className="flex items-center justify-end space-x-2">
                <MapPin className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/70">Current Coverage</span>
              </div>
              <div className="text-2xl font-bold text-white">
                23 Active Districts
              </div>
              <div className="text-sm text-white/80">
                Monitoring Hooghly, Murshidabad, Howrah, South 24 Parganas and
                more.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
