import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SidebarState {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  activeSubRoute: string;
  setActiveSubRoute: (subRoute: string) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      setIsCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
      activeSubRoute: "",
      setActiveSubRoute: (subRoute: string) =>
        set({ activeSubRoute: subRoute }),
    }),
    {
      name: "sidebar-storage",
    }
  )
);
