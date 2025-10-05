import { create } from "zustand";

interface Species {
  id: string;
  label: {
    en: string;
    bn: string;
  };
  value: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat: string[];
  regionDistribution: string[];
  identificationFeatures: string[];
  image: string;
  ageGroup: string;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

interface SpeciesState {
  species: Species[];
  setSpecies: (newSpecies: Species[]) => void;
}

export const useSpecies = create<SpeciesState>((set) => ({
  species: [],
  setSpecies: (newSpecies) => set({ species: newSpecies }),
}));
