"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminStore } from "@/lib/adminStore";
import { AddPartModal } from "@/components/gallery/AddPartModal";
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

  const sliderRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragState = useRef<{ partId: string; startX: number; scrollLeft: number; moved: boolean } | null>(null);

  const fetchData = async () => {
    const { data: appData } = await supabase.from("apps").select("*").eq("id", params.id).single();
    const { data: partsData } = await supabase.from("app_parts").select(`*, app_images(*)`).eq("app_id", params.id).order("sort_order");
    setApp(appData);
    setParts((partsData || []).map((p: any) => ({
      ...p,
      app_images: (p.app_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    })));
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

  // 파트 삭제
  const deletePart = async (partId: string) => {
    if (!confirm("이 파트와 모든 이미지를 삭제할까요?")) return;
    await supabase.from("app_parts").delete().eq("id", partId);
    fetchData();
  };

  // 앱 삭제
  const deleteApp = async () => {
    if (!confirm(`"${app?.name}" 앱을 완전히 삭제할까요? 모든 파트와 이미지가 삭제돼요.`)) return;
    await supabase.from("apps").delete().eq("id", params.id);
    window.close();
  };

  // 파트 순서 변경
  const movePart = async (partId: string, direction: "up" | "down") => {
    const idx = parts.findIndex(p => p.id === partId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === parts.length - 1) return;

    const newParts = [...parts];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newParts[idx], newParts[swapIdx]] = [newParts[swapIdx], newParts[idx]];

    setParts(newParts);

    // DB 업데이트
    await supabase.from("app_parts").update({ sort_order: swapIdx }).eq("id", newParts[swapIdx].id);
    await supabase.from("app_parts").update({ sort_order: idx }).eq("id", newParts[idx].id);
  };

  const allImages = parts.flatMap(p => p.app_images || []);
  const selectedImages = allImages.filter(img => selectedIds.has(img.id));

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
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <Loader2 size={24} className="text-acid animate-spin" />
    </div>
  );

  if (!app) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <p className="text-ink-400">앱을 찾을 수 없어요.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={() => window.close()} className="flex items-center gap-2 text-ink-400 hover:text-ink-100 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">닫기</span>
          </button>
          <div className="flex items-center gap-3 ml-2">
            {app.icon_url
              ? <img src={app.icon_url} alt={app.name} className="w-9 h-9 rounded-xl object-cover border border-ink-700" />
              : <div className="w-9 h-9 rounded-xl bg-ink-700 flex items-center justify-center"><span className="text-sm font-bold text-ink-300">{app.name[0]}</span></div>
            }
            <div>
              <h1 className="font-display text-base text-ink-100">{app.name}</h1>
              <p className="text-[11px] text-ink-500 font-mono">{app.category} · {parts.length}개 파트 · {allImages.length}개 화면</p>
            </div>
          </div>

          {/* 관리자 버튼 */}
          {isAdmin && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowAddPart(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-ink-700 text-ink-300 hover:border-acid hover:text-acid rounded-lg transition-all"
              >
                <Plus size={12} /> 파트 추가
              </button>
              <button
                onClick={deleteApp}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-coral/30 text-coral/70 hover:border-coral hover:text-coral rounded-lg transition-all"
              >
                <Trash2 size={12} /> 앱 삭제
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 파트 섹션들 */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-10">
        {app.description && <p className="text-ink-400 text-sm max-w-xl -mt-4">{app.description}</p>}

        {parts.map((part, pi) => (
          <section key={part.id}>
            {/* 파트 타이틀 */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-bold text-ink-100" style={{ fontSize: "18px" }}>
                {part.part_name}
              </h2>
              <span className="text-xs font-mono text-ink-600">{(part.app_images || []).length}장</span>

              {/* 관리자 파트 컨트롤 */}
              {isAdmin && (
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={() => movePart(part.id, "up")} disabled={pi === 0}
                    className="p-1 text-ink-600 hover:text-acid disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => movePart(part.id, "down")} disabled={pi === parts.length - 1}
                    className="p-1 text-ink-600 hover:text-acid disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button onClick={() => deletePart(part.id)}
                    className="p-1 text-ink-600 hover:text-coral transition-colors ml-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* 가로 슬라이더 */}
            <div
              ref={el => { if (el) sliderRefs.current.set(part.id, el); }}
              onMouseDown={e => onMouseDown(part.id, e)}
              onMouseMove={e => onMouseMove(part.id, e)}
              onMouseUp={() => onMouseUp(part.id)}
              onMouseLeave={() => onMouseUp(part.id)}
              className="flex gap-4 overflow-x-auto pb-3 select-none"
              style={{ cursor: "grab", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {(part.app_images || []).map(img => {
                const selected = selectedIds.has(img.id);
                return (
                  <div
                    key={img.id}
                    onClick={() => toggleSelect(img)}
                    className={cn(
                      "shrink-0 relative rounded-xl overflow-hidden bg-ink-800 cursor-pointer transition-all duration-200",
                      "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink-950/60",
                      selected && "ring-2 ring-acid ring-offset-2 ring-offset-ink-950"
                    )}
                    style={{ width: "160px" }}
                  >
                    <img src={img.image_url} alt="" className="w-full object-cover" draggable={false} />
                    <div
                      onClick={e => { e.stopPropagation(); toggleSelect(img); }}
                      className={cn("absolute top-2 right-2 transition-all", selected ? "opacity-100" : "opacity-0 hover:opacity-100")}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center",
                        selected ? "bg-acid border-acid" : "bg-ink-950/70 border-ink-400 backdrop-blur-sm"
                      )}>
                        {selected && <Check size={10} className="text-ink-950" strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* 하단 선택 바 */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="flex items-center gap-3 bg-ink-800 border border-ink-600 rounded-2xl px-5 py-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-acid rounded-md flex items-center justify-center">
                <Check size={13} className="text-ink-950" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-mono">
                <span className="text-acid font-bold">{selectedIds.size}</span>
                <span className="text-ink-500"> 선택됨</span>
              </span>
            </div>
            <div className="w-px h-4 bg-ink-700" />
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-ink-300 hover:text-acid hover:bg-ink-700 transition-all">
              <Copy size={12} />
              {selectedIds.size === 1 ? "이미지 복사" : "URL 복사"}
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-acid text-ink-950 hover:bg-acid/90 transition-all font-medium"
            >
              {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              JPG 다운로드
            </button>
            <div className="w-px h-4 bg-ink-700" />
            <button onClick={() => setSelectedIds(new Set())} className="text-ink-500 hover:text-ink-300 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 파트 추가 모달 */}
      {showAddPart && app && (
        <AddPartModal
          appId={app.id}
          appName={app.name}
          currentPartCount={parts.length}
          onClose={() => setShowAddPart(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
