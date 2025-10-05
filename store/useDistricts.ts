import { create } from "zustand";

interface District {
  label: string;
  value: string;
}

interface DistrictState {
  districts: District[];
  setDistricts: (districts: District[]) => void;
}

export const useDistrictStore = create<DistrictState>((set) => ({
  districts: [],
  setDistricts: (districts) => set({ districts }),
}));
