"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminStore } from "@/lib/adminStore";
import { useGalleryStore } from "@/lib/store"; // 1. 스토어 임포트
import { AddPartModal } from "@/components/gallery/AddPartModal";
import { Lightbox } from "@/components/gallery/Lightbox"; // 2. 라이트박스 임포트
import { App, AppPart, AppImage } from "@/types";
import { Check, Download, Copy, X, ArrowLeft, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppDetailPage({ params }: { params: { id: string } }) {
  const [app, setApp] = useState<App | null>(null);
  const [parts, setParts] = useState<AppPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const { isAdmin } = useAdminStore();

  // 3. 라이트박스 열기 함수 가져오기
  const { openLightbox } = useGalleryStore();

  const sliderRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragState = useRef<{ partId: string; startX: number; scrollLeft: number; moved: boolean } | null>(null);

const fetchData = async () => {
    const { data: appData } = await supabase.from("apps").select("*").eq("id", params.id).single();
    const { data: partsData } = await supabase
      .from("app_parts").select(`*, app_images(*)`)
      .eq("app_id", params.id).order("sort_order");
    
    setApp(appData);

    // 각 파트의 이미지들에 파트 이름을 미리 넣어줍니다.
    const formattedParts = (partsData || []).map((p: any) => ({
      ...p,
      app_images: (p.app_images || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => ({
          ...img,
          part_name: p.part_name // 여기서 확실히 주입!
        })),
    }));

    setParts(formattedParts);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [params.id]);

  const onMouseDown = (partId: string, e: React.MouseEvent) => {
    const el = sliderRefs.current.get(partId);
    if (!el) return;
    dragState.current = { partId, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    el.style.cursor = "grabbing";
  };
  const onMouseMove = (partId: string, e: React.MouseEvent) => {
    if (!dragState.current || dragState.current.partId !== partId) return;
    const el = sliderRefs.current.get(partId);
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5;
    if (Math.abs(walk) > 5) dragState.current.moved = true;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };
  const onMouseUp = (partId: string) => {
    const el = sliderRefs.current.get(partId);
    if (el) el.style.cursor = "grab";
    dragState.current = null;
  };

  const toggleSelect = (img: AppImage) => {
    if (dragState.current?.moved) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(img.id)) next.delete(img.id);
      else next.add(img.id);
      return next;
    });
  };

  const deletePart = async (partId: string) => {
    if (!confirm("이 파트와 모든 이미지를 삭제할까요?")) return;
    await supabase.from("app_parts").delete().eq("id", partId);
    fetchData();
  };

  const deleteApp = async () => {
    if (!confirm(`"${app?.name}" 앱을 완전히 삭제할까요?`)) return;
    await supabase.from("apps").delete().eq("id", params.id);
    window.close();
  };

  const movePart = async (partId: string, direction: "up" | "down") => {
    const idx = parts.findIndex(p => p.id === partId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === parts.length - 1) return;
    const newParts = [...parts];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newParts[idx], newParts[swapIdx]] = [newParts[swapIdx], newParts[idx]];
    setParts(newParts);
    await supabase.from("app_parts").update({ sort_order: swapIdx }).eq("id", newParts[swapIdx].id);
    await supabase.from("app_parts").update({ sort_order: idx }).eq("id", newParts[idx].id);
  };

  const allImages = parts.flatMap(p => p.app_images || []);
  const handleDownload = async () => {
    setDownloading(true);
    for (const img of selectedImages) {
      try {
        const res = await fetch(img.image_url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${app?.name}_${img.id}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) { console.error(e); }
    }
    setDownloading(false);
  };

  const handleCopy = async () => {
    if (selectedImages.length === 1) {
      try {
        const res = await fetch(selectedImages[0].image_url);
        const blob = await res.blob();
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        imgEl.src = URL.createObjectURL(blob);
        await new Promise(r => { imgEl.onload = r; });
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;
        canvas.getContext("2d")!.drawImage(imgEl, 0, 0);
        canvas.toBlob(async (pngBlob) => {
          if (!pngBlob) return;
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
            alert("✅ 이미지가 클립보드에 복사됐어요!");
          } catch {
            await navigator.clipboard.writeText(selectedImages[0].image_url);
            alert("이미지 URL이 복사됐어요.");
          }
        }, "image/png");
        return;
      } catch (e) { console.error(e); }
    }
    const urls = selectedImages.map(i => i.image_url).join("\n");
    await navigator.clipboard.writeText(urls);
    alert(`${selectedImages.length}개 이미지 URL이 복사됐어요.`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 size={24} className="text-[#c8ff00] animate-spin" />
    </div>
  );

  if (!app) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-[#999999]">앱을 찾을 수 없어요.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center gap-4">
          <button onClick={() => window.close()} className="flex items-center gap-2 text-[#999999] hover:text-[#f0f0f0] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">닫기</span>
          </button>

          <div className="flex items-center gap-3 ml-2">
            {app.icon_url
              ? <img src={app.icon_url} alt={app.name} className="rounded-xl object-cover border border-[#2a2a2a]" style={{ width: "50px", height: "50px" }} />
              : <div className="rounded-xl bg-[#2a2a2a] flex items-center justify-center" style={{ width: "50px", height: "50px" }}><span className="text-lg font-bold text-[#666666]">{app.name[0]}</span></div>
            }
            <div>
              <h1 className="font-bold text-[#f0f0f0]" style={{ fontSize: "18px" }}>{app.name}</h1>
              <p className="text-sm text-[#666666] mt-0.5">
                {(app as any).store_category || (app as any).genre || app.category}
                {" · "}{parts.length}개 파트 · {allImages.length}개 화면
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowAddPart(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-[#3d3d3d] text-[#b8b8b8] hover:border-[#c8ff00] hover:text-[#c8ff00] rounded-lg transition-all"
              >
                <Plus size={16} /> 파트 추가
              </button>
              <button
                onClick={deleteApp}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-[#ff4d3d]/30 text-[#ff4d3d]/70 hover:border-[#ff4d3d] hover:text-[#ff4d3d] rounded-lg transition-all"
              >
                <Trash2 size={16} /> 앱 삭제
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 메인 섹션 */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-10">
        {parts.map((part, pi) => (
          <section key={part.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-bold text-[#f0f0f0]" style={{ fontSize: "18px" }}>{part.part_name}</h2>
              {isAdmin && (
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={() => movePart(part.id, "up")} disabled={pi === 0} className="p-1.5 border border-[#3d3d3d] text-[#666666] hover:text-[#b8b8b8] hover:border-[#555555] disabled:opacity-20 transition-all rounded-md">
                    <ChevronUp size={18} />
                  </button>
                  <button onClick={() => movePart(part.id, "down")} disabled={pi === parts.length - 1} className="p-1.5 border border-[#3d3d3d] text-[#666666] hover:text-[#b8b8b8] hover:border-[#555555] disabled:opacity-20 transition-all rounded-md">
                    <ChevronDown size={18} />
                  </button>
                  <button onClick={() => deletePart(part.id)} className="p-1.5 border border-[#3d3d3d] text-[#666666] hover:text-[#ff4d3d] hover:border-[#ff4d3d]/50 transition-all rounded-md">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={el => { if (el) sliderRefs.current.set(part.id, el); }}
              onMouseDown={e => onMouseDown(part.id, e)}
              onMouseMove={e => onMouseMove(part.id, e)}
              onMouseUp={() => onMouseUp(part.id)}
              onMouseLeave={() => onMouseUp(part.id)}
              className="flex gap-4 select-none overflow-x-auto pb-4 pt-2"
              style={{ cursor: "grab", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {(part.app_images || []).map((img, index) => {
                const selected = selectedIds.has(img.id);
                return (
                  <div
                    key={img.id}
                    className="group shrink-0 relative rounded-xl overflow-hidden bg-[#1c1c1c] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60 border border-[#2a2a2a]"
                    style={{ width: "300px" }}
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        if (dragState.current?.moved) return;
                        openLightbox(part.app_images || [], index);
                      }}
                    >
                      <img src={img.image_url} alt="" className="w-full object-cover" draggable={false} />
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(img);
                      }}
                      className={cn(
                        "absolute top-3 right-3 z-20 cursor-pointer transition-all duration-200",
                        selected ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg border-2 flex items-center justify-center shadow-lg transition-colors",
                        selected ? "bg-[#c8ff00] border-[#c8ff00]" : "bg-black/60 border-white/40 backdrop-blur-md hover:border-[#c8ff00]"
                      )}>
                        {selected && <Check size={14} className="text-black" strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* 하단 바 */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 bg-[#1c1c1c] border border-[#3d3d3d] rounded-2xl px-5 py-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#c8ff00] rounded-md flex items-center justify-center">
                <Check size={13} className="text-[#0a0a0a]" strokeWidth={2.5} />
              </div>
              <span className="text-sm">
                <span className="text-[#c8ff00] font-bold">{selectedIds.size}</span>
                <span className="text-[#666666]"> 선택됨</span>
              </span>
            </div>
            <div className="w-px h-4 bg-[#3d3d3d]" />
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#b8b8b8] hover:text-[#c8ff00] hover:bg-[#2a2a2a] transition-all">
              <Copy size={14} />
              {selectedIds.size === 1 ? "이미지 복사" : "URL 복사"}
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[#c8ff00] text-[#0a0a0a] hover:bg-[#c8ff00]/90 transition-all font-bold"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              JPG 다운로드
            </button>
            <div className="w-px h-4 bg-[#3d3d3d]" />
            <button onClick={() => setSelectedIds(new Set())} className="text-[#666666] hover:text-[#b8b8b8] transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {showAddPart && app && (
        <AddPartModal
          appId={app.id}
          appName={app.name}
          currentPartCount={parts.length}
          onClose={() => setShowAddPart(false)}
          onSuccess={fetchData}
        />
      )}

      <Lightbox />
    </div>
  );
}