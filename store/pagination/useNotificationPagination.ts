import { create } from "zustand";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  initializeStore: (page: number, totalPages: number) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
}

export const useNotificationPagination = create<PaginationState>((set) => ({
  currentPage: 1,
  totalPages: 1,
  initializeStore: (page: number, totalPages: number) =>
    set({
      currentPage: page,
      totalPages,
    }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
}));
