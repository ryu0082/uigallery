export interface App {
  id: string;
  name: string;
  icon_url: string | null;
  category: Category;
  description: string | null;
  created_at: string;
  app_parts?: AppPart[];
  thumbnail?: string;
  part_count?: number;
}

export interface AppPart {
  id: string;
  app_id: string;
  part_name: string;
  sort_order: number;
  created_at: string;
  app_images?: AppImage[];
}

export interface AppImage {
  id: string;
  part_id: string;
  app_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export type Category =
  | "all"
  | "navigation"
  | "hero"
  | "cards"
  | "forms"
  | "dashboard"
  | "mobile"
  | "ecommerce"
  | "landing"
  | "typography";

export interface FilterState {
  category: Category;
  searchQuery: string;
  sortBy: "latest" | "popular" | "name";
  layout: "masonry" | "grid";
}

export interface SelectionState {
  selectedImageIds: Set<string>;
  isSelecting: boolean;
}
