import { create } from "zustand";

interface ModulePaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  initializeStore: (page: number, totalPages: number) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setHasPreviousPage: (hasPrevious: boolean) => void;
}

export const useModulesPagination = create<ModulePaginationState>((set) => ({
  currentPage: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  initializeStore: (page: number, totalPages: number) =>
    set({
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setHasPreviousPage: (hasPrevious) => set({ hasPreviousPage: hasPrevious }),
}));
