"use client";

import { useGalleryStore } from "@/lib/store";
import { GENRES, UI_PATTERNS } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Clock, Check } from "lucide-react";

const COLOR_CHIPS = [
  { id: "black", hex: "#111111" },
  { id: "darkgray", hex: "#555555" },
  { id: "gray", hex: "#999999" },
  { id: "lightgray", hex: "#cccccc" },
  { id: "white", hex: "#f5f5f5", border: true },
  { id: "red", hex: "#e53935" },
  { id: "orange", hex: "#fb8c00" },
  { id: "yellow", hex: "#fdd835" },
  { id: "lightgreen", hex: "#8bc34a" },
  { id: "green", hex: "#2e7d32" },
  { id: "teal", hex: "#00897b" },
  { id: "blue", hex: "#1e88e5" },
  { id: "navy", hex: "#1a237e" },
  { id: "purple", hex: "#7b1fa2" },
  { id: "pink", hex: "#e91e8c" },
];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center w-3.5 h-3.5 rounded-[3px] border shrink-0 transition-all",
        checked
          ? "bg-[#c8ff00] border-[#c8ff00]"
          : "bg-transparent border-[#444444]"
      )}
    >
      {checked && <Check size={9} strokeWidth={3} className="text-black" />}
    </span>
  );
}

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
        <p className="text-xs text-[#b0b0b0] uppercase tracking-wider mb-2 px-2">정렬</p>
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
        <p className="text-xs text-[#b0b0b0] uppercase tracking-wider mb-2 px-2">장르</p>
        <div className="flex flex-col gap-0.5">
          {GENRES.map(({ id, label }) => {
            const isAll = id === "all";
            const isChecked = isAll ? genre.length === 0 : genre.includes(id);
            return (
              <button
                key={id}
                onClick={() => setGenre(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all text-left",
                  isChecked
                    ? "bg-[#2a2a2a] text-[#c8ff00]"
                    : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
                )}
              >
                <Checkbox checked={isChecked} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* UI 패턴 */}
      <div>
        <p className="text-xs text-[#b0b0b0] uppercase tracking-wider mb-2 px-2">UI 패턴</p>
        <div className="flex flex-col gap-0.5">
          {[{ id: "__all__", label: "전체" }, ...UI_PATTERNS.map((p) => ({ id: p, label: p }))].map(({ id, label }) => {
            const isAll = id === "__all__";
            const isChecked = isAll ? uiPattern.length === 0 : uiPattern.includes(id);
            return (
              <button
                key={id}
                onClick={() => isAll ? setUiPattern("__all__") : setUiPattern(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all text-left",
                  isChecked
                    ? "bg-[#2a2a2a] text-[#c8ff00]"
                    : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
                )}
              >
                <Checkbox checked={isChecked} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 컬러 필터 */}
      <div>
        <p className="text-xs text-[#b0b0b0] uppercase tracking-wider mb-3 px-2">컬러</p>
        <div className="grid grid-cols-3 gap-2 px-1">
          {COLOR_CHIPS.map((chip) => {
            const isSelected = selectedColor === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedColor(isSelected ? "all" : chip.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all border",
                  isSelected
                    ? "border-[#c8ff00] bg-[#c8ff00]/10"
                    : "border-transparent hover:border-[#3d3d3d]"
                )}
                title={chip.id}
              >
                <span
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor: chip.hex,
                    border: chip.id === "white" ? "1px solid #3d3d3d" : "none",
                  }}
                />

              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
