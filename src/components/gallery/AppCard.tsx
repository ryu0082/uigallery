"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Images } from "lucide-react";
import { App } from "@/types";
import { cn } from "@/lib/utils";

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  // 첫 번째 이미지를 썸네일로 사용
  const thumbnail = app.app_images?.[0]?.image_url;
  const imageCount = app.image_count || app.app_images?.length || 0;

  return (
    <div
      onClick={() => window.open(`/app/${app.id}`, "_blank")}
      className="group rounded-xl overflow-hidden bg-ink-800 card-lift cursor-pointer"
    >
      {/* 썸네일 */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* 카테고리 */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-2 py-0.5 bg-ink-950/80 backdrop-blur-sm border border-ink-700 rounded text-[10px] font-mono text-ink-300 uppercase tracking-wider">
            {app.category}
          </span>
        </div>
      </div>

      {/* 카드 하단 */}
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        {/* 앱 아이콘 */}
        {app.icon_url ? (
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-ink-700"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-ink-700 border border-ink-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-ink-400">{app.name[0]}</span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-ink-100 truncate">{app.name}</h3>
          {app.description && (
            <p className="text-[11px] text-ink-500 truncate">{app.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
