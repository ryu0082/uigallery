"use client";

import { useState, useEffect, useCallback } from "react";
import { useGalleryStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { AppCard } from "./AppCard";
import { PackageOpen } from "lucide-react";
import { App } from "@/types";

const LOAD_COUNT = 24;

export function GalleryGrid({ refreshKey }: { refreshKey?: number }) {
  // 1. selectedColor를 추가로 가져옵니다.
  const { genre, uiPattern, searchQuery, sortBy, selectedColor } = useGalleryStore();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(LOAD_COUNT);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("apps").select(`
        *,
        app_parts(
          id, part_name, sort_order,
          app_images(id, image_url, sort_order)
        )
      `);

      if (genre !== "all") query = query.eq("genre", genre);
      if (searchQuery.trim()) query = query.ilike("name", `%${searchQuery}%`);
      if (sortBy === "name") query = query.order("name");
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let processed = (data || []).map((app: any) => {
        const parts = (app.app_parts || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
        const firstImage = parts[0]?.app_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
        const totalImages = parts.reduce((sum: number, p: any) => sum + (p.app_images?.length || 0), 0);
        return {
          ...app,
          app_parts: parts,
          thumbnail: firstImage?.image_url || null,
          part_count: parts.length,
          image_count: totalImages,
        };
      });

      // 2. UI 패턴 필터
      if (uiPattern && uiPattern !== "all") {
        processed = processed.filter((app: any) =>
          app.ui_pattern?.includes(uiPattern)
        );
      }

     // 3. 컬러 필터 로직 수정 (dominant_colors 컬럼 사용)
if (selectedColor && selectedColor !== "all") {
  processed = processed.filter((app: any) => 
    // 저장된 dominant_colors 배열 안에 선택한 색상이 있는지 확인
    Array.isArray(app.dominant_colors) && app.dominant_colors.includes(selectedColor)
  );
}

      setApps(processed);
      setVisibleCount(LOAD_COUNT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // 4. 의존성 배열에 selectedColor를 추가해서 색을 바꿀 때마다 다시 실행되게 합니다.
  }, [genre, uiPattern, searchQuery, sortBy, selectedColor]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps, refreshKey]);

  const visible = apps.slice(0, visibleCount);
  const hasMore = visibleCount < apps.length;

  if (loading) {
    return (
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-[#1c1c1c] border border-[#2a2a2a]" style={{ width: "300px" }}>
            <div className="p-4 flex items-center gap-3">
              <div className="skeleton rounded-xl shrink-0" style={{ width: "50px", height: "50px" }} />
              <div className="flex-1 flex flex-col gap-2">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
              </div>
            </div>
            <div className="skeleton w-full aspect-[4/3]" />
          </div>
        ))}
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <PackageOpen size={40} className="text-[#3d3d3d]" />
        <div className="text-center">
          <p className="text-[#999999] text-sm">해당 조건에 맞는 앱이 없어요</p>
          <p className="text-[#666666] text-sm mt-1">다른 필터를 선택하거나 검색어를 바꿔보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {visible.map((app, index) => (
          <div
            key={app.id}
            className="animate-fade-up"
            style={{ animationDelay: `${(index % 12) * 40}ms`, animationFillMode: "both" }}
          >
            <AppCard app={app} />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount(v => v + LOAD_COUNT)}
            className="px-8 py-2.5 border border-[#3d3d3d] text-[#999999] text-sm rounded-lg hover:text-[#c8ff00] transition-all"
          >
            더 보기 ({apps.length - visibleCount}개 남음)
          </button>
        </div>
      )}
    </div>
  );
}