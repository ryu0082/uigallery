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
  const thumbnail = (app as any).thumbnail || null;
  const displayCategory = (app as any).store_category
    ? mapItunesGenre((app as any).store_category)
    : (app as any).genre || app.category || "";

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
          <p className="text-sm text-[#999999] mt-0.5 truncate">
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
        {/* 이미지 갯수 배지 제거됨 */}
        {/* 컬러 스와치 제거됨 - 사이드바 필터로 이동 */}
      </div>
    </div>
  );
}

// iTunes 카테고리 → 한글 매핑 (AppCard에서도 사용)
function mapItunesGenre(itunesGenre: string): string {
  const map: Record<string, string> = {
    "Games": "게임", "Finance": "금융/핀테크", "Shopping": "커머스/쇼핑",
    "Social Networking": "소셜/커뮤니티", "Health & Fitness": "헬스/피트니스",
    "Travel": "여행/지도", "Food & Drink": "음식/배달", "Education": "교육",
    "Entertainment": "엔터테인먼트", "Utilities": "유틸리티", "Lifestyle": "유틸리티",
    "Sports": "스포츠", "Business": "금융/핀테크", "Productivity": "유틸리티",
  };
  return map[itunesGenre] || itunesGenre;
}
