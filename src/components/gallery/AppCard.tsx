"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { App } from "@/types";
import { cn } from "@/lib/utils";

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageCount = (app as any).image_count || 0;
  const thumbnail = (app as any).thumbnail || null;
  const dominantColors: string[] = (app as any).dominant_colors || [];
  const displayCategory = (app as any).store_category || (app as any).genre || app.category || "";

  return (
    <div
      onClick={() => window.open(`/app/${app.id}`, "_blank")}
      className="group rounded-2xl overflow-hidden bg-[#1c1c1c] cursor-pointer border border-[#2a2a2a] hover:border-[#3d3d3d] transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40"
      style={{ width: "300px" }}
    >
      {/* 앱 정보 (위) */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="rounded-xl object-cover shrink-0 border border-[#2a2a2a]"
            style={{ width: "50px", height: "50px" }}
          />
        ) : (
          <div
            className="rounded-xl bg-[#2a2a2a] border border-[#3d3d3d] flex items-center justify-center shrink-0"
            style={{ width: "50px", height: "50px" }}
          >
            <span className="text-lg font-bold text-[#666666]">{app.name[0]}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#f0f0f0] truncate leading-tight" style={{ fontSize: "18px" }}>
            {app.name}
          </h3>
          <p className="text-xs text-[#999999] mt-0.5 truncate">
            {displayCategory}
          </p>
        </div>
      </div>

      {/* 썸네일 */}
      <div className="relative w-full overflow-hidden bg-[#2a2a2a]">
        {thumbnail ? (
          <>
            {!imageLoaded && <div className="skeleton absolute inset-0 aspect-[4/3]" />}
            <img
              src={thumbnail}
              alt={app.name}
              className={cn(
                "w-full object-cover transition-all duration-500 group-hover:scale-[1.01]",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center">
            <Images size={32} className="text-[#3d3d3d]" />
          </div>
        )}

        {imageCount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#2a2a2a] rounded-md text-[10px] font-mono text-[#b8b8b8]">
            {imageCount}장
          </div>
        )}
      </div>

      {/* 색상 스와치 */}
      {dominantColors.length > 0 && (
        <div className="px-4 py-2.5 flex items-center gap-1.5 border-t border-[#2a2a2a]">
          {dominantColors.slice(0, 6).map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border border-[#3d3d3d] shrink-0"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
