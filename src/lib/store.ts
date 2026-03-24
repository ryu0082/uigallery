import { create } from "zustand";
import { FilterState, SelectionState, Genre } from "@/types";

interface GalleryStore extends FilterState, SelectionState {
  setGenre: (genre: Genre) => void;
  setUiPattern: (pattern: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: FilterState["sortBy"]) => void;
  setLayout: (layout: FilterState["layout"]) => void;
  toggleImageSelection: (id: string) => void;
  clearSelection: () => void;
  setIsSelecting: (v: boolean) => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  genre: "all",
  uiPattern: "all",
  searchQuery: "",
  sortBy: "latest",
  layout: "grid",
  selectedImageIds: new Set<string>(),
  isSelecting: false,

  setGenre: (genre) => set({ genre }),
  setUiPattern: (uiPattern) => set({ uiPattern }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setLayout: (layout) => set({ layout }),
  toggleImageSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedImageIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedImageIds: next };
    }),
  clearSelection: () => set({ selectedImageIds: new Set(), isSelecting: false }),
  setIsSelecting: (isSelecting) => set({ isSelecting }),
}));
