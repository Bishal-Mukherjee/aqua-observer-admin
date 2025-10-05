import { create } from "zustand";

interface Tier {
  id: string;
  tier: string;
  title: {
    en: string;
    bn?: string;
  };
  description: {
    en: string;
    bn?: string;
  };
  modules: string;
  users: string;
  isActive: boolean;
  lastUpdatedAt: string;
  createdAt: string;
}
interface TiersState {
  tiers: Tier[];
  setTiers: (tiers: Tier[]) => void;
}

export const useTiersStore = create<TiersState>((set) => ({
  tiers: [],
  setTiers: (tiers) => set({ tiers }),
}));
