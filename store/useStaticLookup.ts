import { create } from "zustand";

interface StaticLookup {
  label: string;
  value: string;
}

interface StaticLookupState {
  disturbances: StaticLookup[];
  fishingGears: StaticLookup[];
  waterBodies: StaticLookup[];
  waterBodyConditions: StaticLookup[];
  weatherConditions: StaticLookup[];
  initializeStore: (data: {
    disturbances?: StaticLookup[];
    fishingGears?: StaticLookup[];
    waterBodies?: StaticLookup[];
    waterBodyConditions?: StaticLookup[];
    weatherConditions?: StaticLookup[];
  }) => void;
}

export const useStaticLookup = create<StaticLookupState>((set) => ({
  disturbances: [],
  fishingGears: [],
  waterBodies: [],
  waterBodyConditions: [],
  weatherConditions: [],
  initializeStore: (data) =>
    set({
      disturbances: data.disturbances,
      fishingGears: data.fishingGears,
      waterBodies: data.waterBodies,
      waterBodyConditions: data.waterBodyConditions,
      weatherConditions: data.weatherConditions,
    }),
}));
