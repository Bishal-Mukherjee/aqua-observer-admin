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
import { Ban, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateSpecies } from "@/services/species";
import { Species } from "@/app/(protected)/species/page";

export const DeactivateSpecies = ({
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
        isActive: false,
      },
      {
        onError: (error) => {
          console.error("Error deactivating species:", error);
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
          <Ban className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            Deactivate Species
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold">{species.label.en}</span>? This
            action will remove the species from active listings and prevent new
            sightings/reportings from being created. Existing data will be
            preserved but marked as inactive.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>Yes, Deactivate Species</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
