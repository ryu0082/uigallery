"use client";

import { useGalleryStore } from "@/lib/store";
import { GENRES, UI_PATTERNS } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Clock } from "lucide-react";

export function Sidebar() {
  const { genre, setGenre, uiPattern, setUiPattern, sortBy, setSortBy } = useGalleryStore();

  return (
    <aside className="w-52 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-6 px-3 border-r border-[#2a2a2a] flex flex-col gap-6">
      {/* 정렬 */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 px-2">
          정렬
        </p>
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
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 장르 */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 px-2">
          장르
        </p>
        <div className="flex flex-col gap-0.5">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenre(g.id)}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-all text-left",
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
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-2 px-2">
          UI 패턴
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setUiPattern("all")}
            className={cn(
              "flex items-center px-2 py-1.5 rounded-lg text-sm transition-all text-left",
              uiPattern === "all"
                ? "bg-[#2a2a2a] text-[#c8ff00]"
                : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
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
                uiPattern === p
                  ? "bg-[#2a2a2a] text-[#c8ff00]"
                  : "text-[#b8b8b8] hover:text-[#f0f0f0] hover:bg-[#1c1c1c]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
