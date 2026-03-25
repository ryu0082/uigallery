"use client";

import { useEffect, useState } from "react";
import { useGalleryStore } from "@/lib/store";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Lightbox() {
  const { isLightboxOpen, lightboxImages, currentImageIndex, closeLightbox, prevImage, nextImage } = useGalleryStore();
  const [shouldRender, setShouldRender] = useState(false);
  const [showMotion, setShowMotion] = useState(false); // 실제 모션을 제어할 상태

  useEffect(() => {
    if (isLightboxOpen) {
      setShouldRender(true);
      // 브라우저가 렌더링을 마친 직후에 모션을 줍니다. (0.01초 지연)
      const timer = setTimeout(() => setShowMotion(true), 10);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setShowMotion(false); // 닫을 때 모션 시작
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "unset";
      }, 300); // 닫기 애니메이션 시간
      return () => clearTimeout(timer);
    }
  }, [isLightboxOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, prevImage, nextImage]);

  if (!shouldRender) return null;

  const currentImage = lightboxImages[currentImageIndex];
  const partName = (currentImage as any)?.part_name || "화면";

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-300 ease-in-out",
        showMotion ? "bg-black/90 backdrop-blur-md opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"
      )}
      onClick={closeLightbox}
    >
      <button className="absolute top-6 right-8 text-white/40 hover:text-white transition-colors z-[110]" onClick={closeLightbox}>
        <X size={32} />
      </button>

      <div 
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-full max-w-[1200px] px-6 md:px-20 pointer-events-none transition-all duration-500",
          // 켤 때: scale 0.8에서 1로, 살짝 튕기는 느낌 (cubic-bezier)
          showMotion 
            ? "scale-100 opacity-100 translate-y-0 cubic-bezier(0.16, 1, 0.3, 1)" 
            : "scale-90 opacity-0 translate-y-4"
        )}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); prevImage(); }}
          className="absolute left-6 md:left-10 w-14 h-14 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all z-[110] pointer-events-auto"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="relative flex items-center justify-center w-full h-full select-none pt-10 pb-20">
          <img 
            src={currentImage.image_url} 
            alt="" 
            onClick={(e) => e.stopPropagation()} 
            className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] pointer-events-auto cursor-default"
          />
        </div>

        {/* 캡션 */}
        <div 
          className={cn(
            "absolute bottom-10 left-1/2 -translate-x-1/2 z-[105] bg-white/10 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto shadow-2xl transition-all duration-700 delay-100",
            showMotion ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white font-semibold text-sm tracking-tight">{partName}</span>
          <div className="w-px h-3 bg-white/20" />
          <span className="text-xs font-medium">
            <span className="text-[#c8ff00]">{currentImageIndex + 1}</span>
            <span className="text-white/30 mx-1">/</span>
            <span className="text-white/50">{lightboxImages.length}</span>
          </span>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-6 md:right-10 w-14 h-14 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all z-[110] pointer-events-auto"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}