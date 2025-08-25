"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CloudCheck, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateSpecies } from "@/services/species";
import { Species } from "@/app/(protected)/species/page";

export const ActivateSpecies = ({
  species,
  onClose,
}: {
  species: Species;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateSpecies();
  const handleSubmit = () => {
    mutate(
      {
        id: species.id,
        scientificName: species.scientificName,
        category: species.category,
        conservationStatus: species.conservationStatus,
        habitat: species.habitat,
        regionDistribution: species.regionDistribution,
        identificationFeatures: species.identificationFeatures,
        image: species.image,
        ageGroup: species.ageGroup,
        isActive: true,
      },
      {
        onError: (error) => {
          console.error("Error activating species:", error);
        },
        onSettled: () => {
          onClose();
          queryClient.invalidateQueries({ queryKey: ["species"] });
        },
      }
    );
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full cursor-pointer bg-black/10 hover:bg-black/20 text-white backdrop-blur-sm"
        >
          <CloudCheck className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CloudCheck className="h-5 w-5 text-green-600" />
            Activate Species
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to activate{" "}
            <span className="font-semibold">{species.label.en}</span>? This
            action will restore the species to active listings and allow new
            sightings/reportings to be created. Existing data will be preserved
            but marked as inactive.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              <>Yes, Activate Species</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
