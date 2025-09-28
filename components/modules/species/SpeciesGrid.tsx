"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { getStatusColor, getCategoryColor } from "@/constants/colorMaps";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import SpeciesDialog from "@/components/modules/species/SpeciesDialog/SpeciesDialog";
import { Species } from "@/app/(protected)/species/page";

// Format conservation status for display
const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

interface SpeciesGridProps {
  species: Species[];
}

export default function SpeciesGrid({ species }: SpeciesGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  const handleCardClick = (species: Species) => {
    setSelectedSpecies(species);
    setIsOpen(true);
  };

  return (
    <Fragment>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {species.map((animal) => (
          <Card
            key={animal.value}
            className={cn(
              "overflow-hidden border-gray-200 pt-0 shadow-none border-0 cursor-pointer transition-transform duration-200 hover:scale-101",
              { "opacity-[0.7]": !animal.isActive }
            )}
            onClick={() => handleCardClick(animal)}
          >
            {/* Card Header */}
            <CardHeader className="relative h-48 w-full bg-gray-50">
              <Image src={animal.image} alt={animal.label.en} fill />
              {!animal.isActive && (
                <div className="absolute top-2 left-2 transition-transform duration-200">
                  <Badge variant="outline" className="text-xs bg-white">
                    Inactive
                  </Badge>
                </div>
              )}
              <div className="absolute top-2 right-2 transition-transform duration-200">
                <Badge
                  variant="secondary"
                  className={cn(
                    getCategoryColor(animal.category),
                    "px-3 border-none"
                  )}
                >
                  {animal.category}
                </Badge>
              </div>
            </CardHeader>

            {/* Card Content */}
            <CardContent className="p-3 space-y-3.5 py-0">
              {/* Title and Scientific Name */}
              <div>
                <h3 className="font-medium text-base leading-tight">
                  {animal.label.en}
                </h3>
                <p className="text-xs text-muted-foreground italic">
                  {animal.scientificName}
                </p>
              </div>

              {/* Conservation Status */}
              <Badge
                variant="outline"
                className={cn(
                  getStatusColor(animal.conservationStatus),
                  "px-3 border-none"
                )}
              >
                {formatStatus(animal.conservationStatus)}
              </Badge>

              {/* Habitat */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Habitat
                </p>
                <div className="flex flex-wrap gap-1">
                  {animal.habitat.slice(0, 2).map((habitat: any) => (
                    <Badge key={habitat} variant="outline" className="text-xs">
                      {habitat.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {animal.habitat.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{animal.habitat.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Region Distribution */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Identification Features
                </p>
                <div className="flex flex-wrap gap-1">
                  {animal.identificationFeatures
                    .slice(0, 2)
                    .map((feature: any) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature.replace(/_/g, " ")}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SpeciesDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        species={selectedSpecies}
      />
    </Fragment>
  );
}
