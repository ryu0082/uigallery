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
  const partCount = (app as any).part_count || 0;
  const thumbnail = (app as any).thumbnail || null;

  // iTunes에서 가져온 카테고리 or 등록된 카테고리
  const displayCategory = (app as any).store_category || app.category || "";

  return (
    <div
      onClick={() => window.open(`/app/${app.id}`, "_blank")}
      className="group rounded-2xl overflow-hidden bg-ink-800 card-lift cursor-pointer border border-ink-700/50 hover:border-ink-600 transition-all"
      style={{ width: "300px" }}
    >
      {/* 앱 정보 (위) */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="rounded-xl object-cover shrink-0 border border-ink-700"
            style={{ width: "50px", height: "50px" }}
          />
        ) : (
          <div
            className="rounded-xl bg-ink-700 border border-ink-600 flex items-center justify-center shrink-0"
            style={{ width: "50px", height: "50px" }}
          >
            <span className="text-lg font-bold text-ink-400">{app.name[0]}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-ink-100 truncate leading-tight" style={{ fontSize: "18px" }}>
            {app.name}
          </h3>
          <p className="text-xs text-ink-500 mt-0.5 truncate">
            {displayCategory}
          </p>
        </div>
      </div>

      {/* 썸네일 (아래) */}
      <div className="relative w-full overflow-hidden bg-ink-700">
        {thumbnail ? (
          <>
            {!imageLoaded && <div className="skeleton absolute inset-0" style={{ paddingBottom: "75%" }} />}
            <img
              src={thumbnail}
              alt={app.name}
              className={cn(
                "w-full object-cover transition-all duration-500 group-hover:scale-[1.02]",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full aspect-[4/3] flex items-center justify-center bg-ink-700">
            <Images size={32} className="text-ink-600" />
          </div>
        )}

        {/* 이미지 갯수 배지 */}
        {imageCount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-ink-950/80 backdrop-blur-sm border border-ink-700 rounded-md text-[10px] font-mono text-ink-300">
            {imageCount}장
          </div>
        )}

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </div>
  );
}
