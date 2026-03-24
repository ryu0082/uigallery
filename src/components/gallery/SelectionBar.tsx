"use client";

import { useGalleryStore } from "@/lib/store";
import { mockGalleryData } from "@/lib/data";
import { Download, X, Copy, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectionBar() {
  const { selectedIds, clearSelection, selectAll, category } = useGalleryStore();

  if (selectedIds.size === 0) return null;

  const filteredIds = mockGalleryData
    .filter(item => category === "all" || item.category === category)
    .map(i => i.id);

  const handleExportJSON = () => {
    const selected = mockGalleryData.filter(i => selectedIds.has(i.id));
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uivault-${selected.length}-items.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyURLs = () => {
    const selected = mockGalleryData.filter(i => selectedIds.has(i.id));
    const urls = selected.map(i => i.imageUrl).join("\n");
    navigator.clipboard.writeText(urls);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
      <div className="flex items-center gap-3 bg-ink-800 border border-ink-600 rounded-2xl px-5 py-3 shadow-2xl">
        {/* Count */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-acid rounded-md flex items-center justify-center">
            <CheckSquare size={13} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-mono text-ink-100">
            <span className="text-acid font-bold">{selectedIds.size}</span>
            <span className="text-ink-500"> selected</span>
          </span>
        </div>

        <div className="w-px h-4 bg-ink-700" />

        {/* Select all */}
        <button
          onClick={() => selectAll(filteredIds)}
          className="text-xs font-mono text-ink-400 hover:text-acid transition-colors"
        >
          Select all ({filteredIds.length})
        </button>

        <div className="w-px h-4 bg-ink-700" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyURLs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-ink-300 hover:text-acid hover:bg-ink-700 transition-all"
          >
            <Copy size={12} />
            Copy URLs
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-acid text-ink-950 hover:bg-acid/90 transition-all font-medium"
          >
            <Download size={12} />
            Export JSON
          </button>
        </div>

        <div className="w-px h-4 bg-ink-700" />

        {/* Clear */}
        <button
          onClick={clearSelection}
          className="text-ink-500 hover:text-ink-300 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
