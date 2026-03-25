export interface App {
  id: string;
  name: string;
  icon_url: string | null;
  store_icon_url?: string | null;
  store_category?: string | null;
  bundle_id?: string | null;
  category: Category;
  genre?: Genre | null;
  ui_pattern?: string[];
  dominant_colors?: string[];
  description: string | null;
  created_at: string;
  app_parts?: AppPart[];
  thumbnail?: string;
  part_count?: number;
  image_count?: number;
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

export type Genre =
  | "all"
  | "게임"
  | "건강/의료"
  | "교육/도서"
  | "금융/핀테크"
  | "라이프스타일"
  | "쇼핑/커머스"
  | "소셜/커뮤니티"
  | "엔터테인먼트"
  | "여행/지도"
  | "도구/관리"      // 유틸리티 대신 변경
  | "음식/배달"
  | "키즈";

export const GENRES: { id: Genre; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "게임", label: "게임" },
  { id: "건강/의료", label: "건강/의료" },
  { id: "교육/도서", label: "교육/도서" },
  { id: "금융/핀테크", label: "금융/핀테크" },
  { id: "도구/관리", label: "도구/관리" }, 
  { id: "라이프스타일", label: "라이프스타일" },
  { id: "쇼핑/커머스", label: "쇼핑/커머스" },
  { id: "소셜/커뮤니티", label: "소셜/커뮤니티" },
  { id: "엔터테인먼트", label: "엔터테인먼트" },
  { id: "여행/지도", label: "여행/지도" },
  { id: "음식/배달", label: "음식/배달" },
  { id: "키즈", label: "키즈" },
];

// 사이드바 필터 + 파트명 드롭다운 동일하게 사용
export const UI_PATTERNS = [
  "온보딩",
  "스플래시",
  "로그인/회원가입",
  "홈/메인",
  "검색",
  "상세페이지",
  "목록/피드",
  "마이페이지",
  "설정",
  "결제/구매",
  "채팅/메시지",
  "알림",
  "대시보드",
  "프로필",
  "지도",
  "카메라/미디어",
];

export type Category = "all" | string;

export interface FilterState {
  genre: Genre;
  uiPattern: string;
  searchQuery: string;
  sortBy: "latest" | "popular" | "name";
  layout: "masonry" | "grid";
}

export interface SelectionState {
  selectedImageIds: Set<string>;
  isSelecting: boolean;
}
