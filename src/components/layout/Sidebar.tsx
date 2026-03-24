"use client";

import { useGalleryStore } from "@/lib/store";
import { allCategories, popularTags } from "@/lib/data";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Clock } from "lucide-react";

export function Sidebar() {
  const { category, setCategory, sortBy, setSortBy } = useGalleryStore();

  return (
    <aside className="w-56 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto py-6 px-4 border-r border-ink-800 flex flex-col gap-6">
      {/* Sort */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-2 px-2">
          Sort by
        </p>
        <div className="flex flex-col gap-0.5">
          {[
            { id: "latest" as const, label: "Latest", icon: Clock },
            { id: "popular" as const, label: "Popular", icon: TrendingUp },
            { id: "name" as const, label: "Name", icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSortBy(id)}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all text-left",
                sortBy === id
                  ? "bg-ink-800 text-acid"
                  : "text-ink-400 hover:text-ink-100 hover:bg-ink-800/50"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-2 px-2">
          Category
        </p>
        <div className="flex flex-col gap-0.5">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all group",
                category === cat.id
                  ? "bg-ink-800 text-acid"
                  : "text-ink-400 hover:text-ink-100 hover:bg-ink-800/50"
              )}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-ink-500 mb-2 px-2">
          Tags
        </p>
        <div className="flex flex-wrap gap-1.5 px-1">
          {popularTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs font-mono text-ink-500 border border-ink-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
