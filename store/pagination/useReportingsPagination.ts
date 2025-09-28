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
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
}

export const useReportingsPagination = create<PaginationState>((set) => ({
  currentPage: 0,
  totalPages: 0,
  totalRecords: 0,
  initializeStore: (page: number, totalPages: number, totalRecords: number) =>
    set({
      currentPage: page,
      totalPages,
      totalRecords,
    }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
}));
