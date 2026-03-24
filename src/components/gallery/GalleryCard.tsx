"use client";

import { useState, useEffect } from "react";
import { Heart, Check, Bookmark, ExternalLink } from "lucide-react";
import { GalleryItem } from "@/types";
import { useGalleryStore } from "@/lib/store";
import { cn, formatNumber, timeAgo } from "@/lib/utils";

interface GalleryCardProps {
  item: GalleryItem;
  style?: React.CSSProperties;
}

export function GalleryCard({ item, style }: GalleryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isSelecting, selectedIds, toggleSelection } = useGalleryStore();
  const isSelected = selectedIds.has(item.id);

  return (
    <div
      style={style}
      onClick={() => isSelecting && toggleSelection(item.id)}
      className={cn(
        "relative group rounded-xl overflow-hidden bg-ink-800 card-lift cursor-pointer",
        isSelected && "ring-2 ring-acid ring-offset-2 ring-offset-ink-950"
      )}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden">
        {!imageLoaded && (
          <div className="skeleton w-full" style={{ paddingBottom: "66%" }} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url || item.imageUrl}
          alt={item.title}
          className={cn(
            "w-full object-cover transition-all duration-500 group-hover:scale-[1.02]",
            imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-2 py-0.5 bg-ink-950/80 backdrop-blur-sm border border-ink-700 rounded text-[10px] font-mono text-ink-300 uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        {/* Select checkbox */}
        <div
          className={cn(
            "absolute top-3 right-3 transition-all",
            isSelecting ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
        >
          <div className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
            isSelected ? "bg-acid border-acid" : "bg-ink-950/60 border-ink-500 backdrop-blur-sm hover:border-acid"
          )}>
            {isSelected && <Check size={12} className="text-ink-950" strokeWidth={3} />}
          </div>
        </div>

        {/* Quick actions */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
            className={cn(
              "w-8 h-8 rounded-lg backdrop-blur-sm border flex items-center justify-center transition-all",
              bookmarked ? "bg-acid border-acid text-ink-950" : "bg-ink-950/60 border-ink-700 text-ink-300 hover:border-acid hover:text-acid"
            )}
          >
            <Bookmark size={13} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(item.image_url || item.imageUrl, "_blank"); }}
            className="w-8 h-8 rounded-lg bg-ink-950/60 backdrop-blur-sm border border-ink-700 text-ink-300 hover:border-acid hover:text-acid flex items-center justify-center transition-all"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-ink-100 truncate leading-tight">{item.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-ink-500 font-mono">{item.author}</span>
              <span className="text-[11px] text-ink-700">·</span>
              <span className="text-[11px] text-ink-600 font-mono">
                {mounted ? timeAgo(item.createdAt || item.created_at) : ""}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="flex items-center gap-1 shrink-0 group/like"
          >
            <Heart
              size={13}
              className={cn("transition-all", liked ? "text-coral fill-coral" : "text-ink-600 group-hover/like:text-coral")}
              fill={liked ? "currentColor" : "none"}
            />
            <span className={cn("text-[11px] font-mono transition-colors", liked ? "text-coral" : "text-ink-600")}>
              {formatNumber((item.likes || 0) + (liked ? 1 : 0))}
            </span>
          </button>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] font-mono text-ink-600 bg-ink-800 border border-ink-700 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
