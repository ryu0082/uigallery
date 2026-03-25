import { create } from "zustand";
import { FilterState, SelectionState, Genre, AppImage } from "@/types"; // AppImage 추가

interface GalleryStore extends FilterState, SelectionState {
  selectedColor: string;
  // 라이트박스 상태 추가
  isLightboxOpen: boolean;
  lightboxImages: AppImage[];
  currentImageIndex: number;
  
  setGenre: (genre: Genre) => void;
  setUiPattern: (pattern: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: FilterState["sortBy"]) => void;
  setLayout: (layout: FilterState["layout"]) => void;
  setSelectedColor: (color: string) => void;
  toggleImageSelection: (id: string) => void;
  clearSelection: () => void;
  setIsSelecting: (v: boolean) => void;

  // 라이트박스 액션 추가
  openLightbox: (images: AppImage[], index: number) => void;
  closeLightbox: () => void;
  prevImage: () => void;
  nextImage: () => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  genre: [],           // "all" 대신 빈 배열 = 전체
  uiPattern: [],       // "all" 대신 빈 배열 = 전체
  searchQuery: "",
  sortBy: "latest",
  layout: "grid",
  selectedColor: "all",
  selectedImageIds: new Set<string>(),
  isSelecting: false,
  
  // 라이트박스 초기값
  isLightboxOpen: false,
  lightboxImages: [],
  currentImageIndex: 0,

  // toggle 방식: 이미 선택된 항목이면 제거, 없으면 추가
  setGenre: (genre) =>
    set((state) => {
      if (genre === "all") return { genre: [] };
      const next = state.genre.includes(genre)
        ? state.genre.filter((g) => g !== genre)
        : [...state.genre, genre];
      return { genre: next };
    }),

  setUiPattern: (pattern) =>
    set((state) => {
      if (pattern === "__all__") return { uiPattern: [] };
      const next = state.uiPattern.includes(pattern)
        ? state.uiPattern.filter((p) => p !== pattern)
        : [...state.uiPattern, pattern];
      return { uiPattern: next };
    }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setLayout: (layout) => set({ layout }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  toggleImageSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedImageIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedImageIds: next };
    }),
  clearSelection: () => set({ selectedImageIds: new Set(), isSelecting: false }),
  setIsSelecting: (isSelecting) => set({ isSelecting }),

  // 라이트박스 기능 구현
  openLightbox: (images, index) => set({ 
    isLightboxOpen: true, 
    lightboxImages: images, 
    currentImageIndex: index 
  }),
  closeLightbox: () => set({ isLightboxOpen: false }),
  prevImage: () => set((state) => ({ 
    currentImageIndex: (state.currentImageIndex - 1 + state.lightboxImages.length) % state.lightboxImages.length 
  })),
  nextImage: () => set((state) => ({ 
    currentImageIndex: (state.currentImageIndex + 1) % state.lightboxImages.length 
  })),
}));
