"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    title: "Dolphin Pod Research",
    description: "Latest findings from Pacific Coast",
  },
  {
    src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
    title: "Marine Conservation",
    description: "Protecting dolphin habitats",
  },
  {
    src: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop",
    title: "Observer Training",
    description: "New certification program",
  },
];

export default function CarouselSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  return (
    <Card className="lg:col-span-3 border-0 shadow-none bg-transparent">
      <CardContent className="p-0 relative overflow-hidden rounded-2xl">
        <div className="relative h-60">
          <img
            src={carouselImages[currentSlide].src}
            alt={carouselImages[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-between">
            <div className="flex justify-between items-start p-4">
              <div className="flex space-x-1">
                {carouselImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white p-1 h-8 w-8 rounded-full backdrop-blur-sm cursor-pointer"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white p-1 h-8 w-8 rounded-full backdrop-blur-sm cursor-pointer"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-white">
              <Badge
                variant="secondary"
                className="text-blue-600 border-0 mb-2 text-xs bg-white"
              >
                FEATURED CONTENT
              </Badge>
              <h3 className="font-semibold text-sm mb-1">
                {carouselImages[currentSlide].title}
              </h3>
              <p className="text-xs text-gray-200">
                {carouselImages[currentSlide].description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
