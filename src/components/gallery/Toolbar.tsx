"use client";

import { useGalleryStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Search, LayoutGrid, LayoutDashboard, X } from "lucide-react";

export function Toolbar() {
  const { searchQuery, setSearchQuery, layout, setLayout } = useGalleryStore();

  return (
    <div className="flex items-center gap-3 py-4 px-1">
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
        <input
          type="text"
          placeholder="앱 이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg pl-9 pr-4 py-2 text-sm text-[#d4d4d4] placeholder-[#666666] focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#b8b8b8]">
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-[#1c1c1c] rounded-lg p-1 border border-[#3d3d3d]">
        <button
          onClick={() => setLayout("grid")}
          className={cn("p-1.5 rounded-md transition-all", layout === "grid" ? "bg-[#3d3d3d] text-[#c8ff00]" : "text-[#666666] hover:text-[#b8b8b8]")}
          title="그리드"
        >
          <LayoutGrid size={14} />
        </button>
        <button
          onClick={() => setLayout("masonry")}
          className={cn("p-1.5 rounded-md transition-all", layout === "masonry" ? "bg-[#3d3d3d] text-[#c8ff00]" : "text-[#666666] hover:text-[#b8b8b8]")}
          title="메이슨리"
        >
          <LayoutDashboard size={14} />
        </button>
      </div>
    </div>
  );
}
