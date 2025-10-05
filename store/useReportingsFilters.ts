import { create } from "zustand";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  initializeStore: (
    page: number,
    totalPages: number,
    totalRecords: number
  ) => void;
  clearStore: () => void;
  districts: string[];
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setDistricts: (districts: string[]) => void;
}

export const useReportingsFilters = create<PaginationState>((set) => ({
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
  clearStore: () =>
    set({ currentPage: 0, totalPages: 0, totalRecords: 0, districts: [] }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setDistricts: (districts) => set({ districts }),
}));
