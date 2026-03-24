"use client";

import { useGalleryStore } from "@/lib/store";
import { GENRES, UI_PATTERNS } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Clock } from "lucide-react";

const COLOR_CHIPS = [
  { id: "black",      label: "블랙",        hex: "#111111" },
  { id: "darkgray",   label: "다크그레이",  hex: "#555555" },
  { id: "gray",       label: "그레이",      hex: "#999999" },
  { id: "lightgray",  label: "라이트그레이",hex: "#cccccc" },
  { id: "white",      label: "화이트",      hex: "#f5f5f5", border: true },
  { id: "red",        label: "레드",        hex: "#e53935" },
  { id: "orange",     label: "오렌지",      hex: "#fb8c00" },
  { id: "yellow",     label: "옐로우",      hex: "#fdd835" },
  { id: "lightgreen", label: "라이트그린",  hex: "#8bc34a" },
  { id: "green",      label: "그린",        hex: "#2e7d32" },
  { id: "teal",       label: "틸/민트",     hex: "#00897b" },
  { id: "blue",       label: "블루",        hex: "#1e88e5" },
  { id: "navy",       label: "네이비",      hex: "#1a237e" },
  { id: "purple",     label: "퍼플",        hex: "#7b1fa2" },
  { id: "pink",       label: "핑크",        hex: "#e91e8c" },
];

export function Sidebar() {
  const {
    genre, setGenre,
    uiPattern, setUiPattern,
    sortBy, setSortBy,
    selectedColor, setSelectedColor,
  } = useGalleryStore() as any;

  return (
    <aside className="w-52 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-6 px-3 border-r border-[#2a2a2a] flex flex-col gap-6">

      {/* 정렬 */}
      <div>
        <p className="text-xs text-[#666666] uppercase tracking-wider mb-2 px-2">정렬</p>
        <div className="flex flex-col gap-0.5">
          {[
            { id: "latest" as const, label: "최신순", icon: Clock },
            { id: "popular" as const, label: "인기순", icon: TrendingUp },
            { id: "name" as const, label: "이름순", icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSortBy(id)}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all text-left",
                sortBy === id
                  ? "bg-[#2a2a2a] text-[#c8ff00]"
                  : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 장르 */}
      <div>
        <p className="text-xs text-[#666666] uppercase tracking-wider mb-2 px-2">장르</p>
        <div className="flex flex-col gap-0.5">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenre(g.id)}
              className={cn(
                "flex items-center px-2 py-1.5 rounded-lg text-sm transition-all text-left",
                genre === g.id
                  ? "bg-[#2a2a2a] text-[#c8ff00]"
                  : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* UI 패턴 */}
      <div>
        <p className="text-xs text-[#666666] uppercase tracking-wider mb-2 px-2">UI 패턴</p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setUiPattern("all")}
            className={cn(
              "flex items-center px-2 py-1.5 rounded-lg text-sm transition-all text-left",
              uiPattern === "all" ? "bg-[#2a2a2a] text-[#c8ff00]" : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
            )}
          >
            전체
          </button>
          {UI_PATTERNS.map((p) => (
            <button
              key={p}
              onClick={() => setUiPattern(p)}
              className={cn(
                "flex items-center px-2 py-1.5 rounded-lg text-sm transition-all text-left",
                uiPattern === p ? "bg-[#2a2a2a] text-[#c8ff00]" : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 컬러 필터 */}
      <div>
        <p className="text-xs text-[#666666] uppercase tracking-wider mb-3 px-2">컬러</p>
        <div className="grid grid-cols-3 gap-2 px-1">
          {COLOR_CHIPS.map((chip) => {
            const isSelected = selectedColor === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedColor(isSelected ? "all" : chip.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-1.5 rounded-lg transition-all border",
                  isSelected
                    ? "border-[#c8ff00] bg-[#c8ff00]/10"
                    : "border-transparent hover:border-[#3d3d3d]"
                )}
                title={chip.label}
              >
                <span
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor: chip.hex,
                    border: chip.id === "white" ? "1px solid #3d3d3d" : "none",
                  }}
                />
                <span className={cn(
                  "text-[11px] leading-tight text-center",
                  isSelected ? "text-[#c8ff00]" : "text-[#666666]"
                )}>
                  {chip.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
