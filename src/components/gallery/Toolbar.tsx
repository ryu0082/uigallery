"use client";

import { useGalleryStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export function Toolbar() {
  const { searchQuery, setSearchQuery } = useGalleryStore();

  return (
    // justify-center를 추가하여 내부 요소를 가운데로 정렬했습니다.
    <div className="flex items-center justify-center py-6 px-1 w-full mb-12"> 
      
      {/* w-full과 max-w-[50%]를 조합하여 전체의 딱 절반만큼만 차지하게 합니다. */}
      <div className="relative w-full max-w-[50%] min-w-[320px]"> 
        <Search 
          size={18} 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" 
        />
        <input
          type="text"
          placeholder="앱 이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-xl pl-12 pr-12 py-4 text-base text-[#d4d4d4] transition-all",
            "placeholder-[#999999]",
            "focus:outline-none focus:border-[#c8ff00] focus:bg-[#222222] focus:ring-1 focus:ring-[#c8ff00]/20"
          )}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#f0f0f0] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}