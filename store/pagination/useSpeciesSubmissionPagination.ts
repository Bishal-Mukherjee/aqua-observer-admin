import { create } from "zustand";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  districts: string[];
  initializeStore: (
    page: number,
    totalPages: number,
    totalRecords: number
  ) => void;
  setCurrentPage: (page: number) => void;
  setDistricts: (districts: string[]) => void;
  setTotalPages: (pages: number) => void;
}

export const useSpeciesSubmissionPagination = create<PaginationState>(
  (set) => ({
    currentPage: 0,
    totalPages: 0,
    totalRecords: 0,
    districts: [],
    initializeStore: (page: number, totalPages: number, totalRecords: number) =>
      set({
        currentPage: page,
        totalPages,
        totalRecords,
      }),
    setCurrentPage: (page) => set({ currentPage: page }),
    setTotalPages: (pages) => set({ totalPages: pages }),
    setDistricts: (districts) => set({ districts }),
  })
);
