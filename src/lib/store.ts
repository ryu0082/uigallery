import { create } from "zustand";
import { FilterState, SelectionState, Category } from "@/types";

interface GalleryStore extends FilterState, SelectionState {
  setCategory: (category: Category) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: FilterState["sortBy"]) => void;
  setLayout: (layout: FilterState["layout"]) => void;
  toggleImageSelection: (id: string) => void;
  selectAllImages: (ids: string[]) => void;
  clearSelection: () => void;
  setIsSelecting: (v: boolean) => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  category: "all",
  searchQuery: "",
  sortBy: "latest",
  layout: "masonry",
  selectedImageIds: new Set<string>(),
  isSelecting: false,

  setCategory: (category) => set({ category }),
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
  selectAllImages: (ids) => set({ selectedImageIds: new Set(ids) }),
  clearSelection: () => set({ selectedImageIds: new Set(), isSelecting: false }),
  setIsSelecting: (isSelecting) => set({ isSelecting }),
}));
