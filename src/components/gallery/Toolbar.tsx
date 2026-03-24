"use client";

import { useGalleryStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Search, LayoutGrid, LayoutDashboard, X } from "lucide-react";

export function Toolbar() {
  const {
    searchQuery, setSearchQuery,
    layout, setLayout,
  } = useGalleryStore();

  return (
    <div className="flex items-center gap-3 py-4 px-1">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-ink-800 border border-ink-700 rounded-lg pl-9 pr-4 py-2 text-sm text-ink-200 placeholder-ink-500 focus:outline-none focus:border-acid/50 transition-colors font-mono"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Layout toggle */}
      <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-1 border border-ink-700">
        <button
          onClick={() => setLayout("masonry")}
          className={cn("p-1.5 rounded-md transition-all", layout === "masonry" ? "bg-ink-600 text-acid" : "text-ink-500 hover:text-ink-300")}
          title="Masonry"
        >
          <LayoutDashboard size={14} />
        </button>
        <button
          onClick={() => setLayout("grid")}
          className={cn("p-1.5 rounded-md transition-all", layout === "grid" ? "bg-ink-600 text-acid" : "text-ink-500 hover:text-ink-300")}
          title="Grid"
        >
          <LayoutGrid size={14} />
        </button>
      </div>
    </div>
  );
}
