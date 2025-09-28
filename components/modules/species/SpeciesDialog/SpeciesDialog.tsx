"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getStatusColor, getCategoryColor } from "@/constants/colorMaps";
import {
  MapPin,
  Leaf,
  Eye,
  X,
  Bird,
  Worm,
  Squirrel,
  //   Users,
  //   Siren,
  //   Binoculars,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditSpeciesDialog } from "@/components/modules/species/SpeciesDialog/EditSpeciesDialog";
import { DeactivateSpecies } from "@/components/modules/species/SpeciesDialog/DeactivateSpecies";
import { ActivateSpecies } from "./ActivateSpecies";
import Link from "next/link";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "BIRD":
      return <Bird className="h-4 w-4 text-sky-600" />;
    case "MAMMAL":
      return <Leaf className="h-4 w-4 text-purple-600" />;
    case "REPTILE":
      return <Worm className="h-4 w-4 text-emerald-600" />;
    default:
      return <Squirrel className="h-4 w-4 text-gray-600" />;
  }
};

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Nature background images based on species category (using online URLs)
const getNatureBackground = (category: string) => {
  switch (category) {
    case "BIRD":
      return "https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=2070&auto=format&fit=crop"; // Sky with lake
    case "MAMMAL":
      return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop"; // Forest with water
    case "REPTILE":
      return "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=500&auto=format&fit=crop"; // Mangrove/wetland
    default:
      return "https://images.unsplash.com/photo-1566024287286-457247b70310?q=80&w=2071&auto=format&fit=crop"; // Ocean water
  }
};

interface SpeciesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  species: any;
}

export default function SpeciesDialog({
  isOpen,
  onClose,
  species,
}: SpeciesDialogProps) {
  if (!species) return null;

  // Use a nature background appropriate for the species
  const backgroundImage = getNatureBackground(species.category);

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="min-w-[75vw] max-w-[90vw] max-h-[90vh] p-0 overflow-hidden border-0 shadow-lg">
          <div
            className={cn("absolute top-3 right-24 z-10", {
              "right-14": !species?.isActive,
            })}
            title="Deactivate"
          >
            {/* Activate/Deactivate Species Confirmation Dialog */}
            {!species?.isActive ? (
              <ActivateSpecies species={species} onClose={handleClose} />
            ) : (
              <DeactivateSpecies species={species} onClose={handleClose} />
            )}
          </div>
          {species.isActive && (
            <div className="absolute top-3 right-14 z-10" title="Edit">
              {/* Edit Species Dialog */}
              <EditSpeciesDialog species={species} onClose={handleClose} />
            </div>
          )}
          <div className="absolute top-3 right-3 z-10" title="Close">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full cursor-pointer bg-black/10 hover:bg-black/20 text-white backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="max-h-[80vh]">
            {/* Header Section with Nature Background */}
            <div className="relative">
              {/* Background Nature Image */}
              <div className="relative h-60 w-full">
                <Image
                  src={backgroundImage}
                  alt="Natural habitat"
                  fill
                  className="object-cover brightness-[0.8]"
                  // priority
                  // unoptimized // Required for external URLs
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent"></div>

                {/* Profile-like Species Image */}
                <div className="absolute -bottom-8 left-6 w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-lg">
                  <Image
                    src={species.image}
                    alt={species.label.en}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Category Badge */}
                <div className="absolute top-6 left-6">
                  <Badge
                    className={cn(
                      getCategoryColor(species.category),
                      "px-3 py-1 text-xs font-medium border shadow-sm"
                    )}
                  >
                    {species.category}
                  </Badge>
                </div>
              </div>

              {/* Main Content */}
              <div className="rounded-t-xl bg-background shadow-sm pt-12 pb-4 px-6">
                {/* Species Title and Scientific Name */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 mb-8">
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      {species.label.en}
                    </DialogTitle>
                    <DialogDescription className="text-base italic text-muted-foreground">
                      {species.scientificName}
                    </DialogDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      getStatusColor(species.conservationStatus),
                      "text-sm border-none px-2"
                    )}
                  >
                    {formatStatus(species.conservationStatus)}
                  </Badge>
                </div>

                {/* Two Column Layout: Location and Identification Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Location & Environment Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="inline-block p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                        <MapPin className="h-4 w-4 text-primary" />
                      </span>
                      Location & Environment
                    </h2>

                    <div className="space-y-6 grid grid-cols-2">
                      {/* Habitat */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Leaf className="h-3.5 w-3.5 text-green-600" />
                          Habitat
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {species.habitat.map((habitat: string) => (
                            <Badge
                              key={habitat}
                              variant="outline"
                              className="px-2.5 py-0.5 text-xs bg-green-50/50 border-none text-green-700 dark:bg-green-950/50 dark:text-green-300"
                            >
                              {habitat.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Distribution */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-600" />
                          Geographic Distribution
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {species.regionDistribution.map((region: string) => (
                            <Badge
                              key={region}
                              variant="outline"
                              className="px-2.5 py-0.5 text-xs bg-blue-50/50 border-none text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                            >
                              {region.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Age Group Section */}

                    <div className="space-y-2 mt-[-16px]">
                      <div className="flex flex-wrap gap-1.5">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          Age Group
                        </h3>
                        <Badge
                          variant="outline"
                          className="px-2.5 py-0.5 text-xs bg-purple-50/50 border-none text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                        >
                          {species.ageGroup}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {species.ageGroup === "duo"
                          ? `For ${species.label.en} submissions for 'Adult' and 'Subadult' will be made`
                          : `For ${species.label.en} submissions for 'Adult Male', 'Adult Female', 'Subadult' will be made`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="inline-block p-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                        <Eye className="h-4 w-4 text-primary" />
                      </span>
                      Identification Features
                    </h2>

                    <div className="space-y-6 grid grid-cols-2">
                      {/* Distribution */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          {getCategoryIcon(species.category)}
                          Attributes
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {species.identificationFeatures.map(
                            (feature: string) => (
                              <Badge
                                key={feature}
                                variant="outline"
                                className="px-2.5 py-0.5 text-xs bg-gray-50 border-none text-black-700 dark:bg-blue-950/50 dark:text-blue-300"
                              >
                                {feature}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-auto mb-1">
                      <Link
                        href={`/species/reportings?species=${species.value}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <p className="text-xs">View Reportings</p>
                      </Link>

                      <Link
                        href={`/species/sightings?species=${species.value}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <p className="text-xs">View Sightings</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
