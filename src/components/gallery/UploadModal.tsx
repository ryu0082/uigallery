"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, ImagePlus, Loader2, Plus, Trash2, ChevronDown, Search, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENRES, UI_PATTERNS } from "@/types";
import { extractColorsFromFile } from "@/lib/colorExtractor";

interface ItunesResult {
  trackName: string;
  artworkUrl100: string;
  artworkUrl512: string;
  bundleId: string;
  primaryGenreName: string;
}

interface PartEntry {
  partName: string;
  showDropdown: boolean;
  files: File[];
  previews: string[];
}

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PART_NAME_PRESETS = [
  "온보딩", "스플래시", "로그인", "회원가입", "홈", "메인",
  "검색", "상세", "목록", "마이페이지", "설정", "알림",
  "결제", "장바구니", "리뷰", "채팅", "프로필", "랭킹",
  "대시보드", "통계", "공지사항", "이벤트", "튜토리얼", "에러", "쇼핑", "피드",
];

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("게임");
  const [selectedUiPatterns, setSelectedUiPatterns] = useState<string[]>([]);

  // 아이콘
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [iconSearchResults, setIconSearchResults] = useState<ItunesResult[]>([]);
  const [iconSearching, setIconSearching] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<ItunesResult | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [useDirectUpload, setUseDirectUpload] = useState(false);

  // 컬러
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [extractingColors, setExtractingColors] = useState(false);

  const [parts, setParts] = useState<PartEntry[]>([
    { partName: "", showDropdown: false, files: [], previews: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const iconRef = useRef<HTMLInputElement>(null);
  const imageRefs = useRef<(HTMLInputElement | null)[]>([]);

  const searchItunes = useCallback(async () => {
    if (!iconSearchQuery.trim()) return;
    setIconSearching(true);
    setIconSearchResults([]);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(iconSearchQuery)}&entity=software&limit=6&country=kr`);
      const data = await res.json();
      setIconSearchResults(data.results || []);
    } catch { setIconSearchResults([]); }
    finally { setIconSearching(false); }
  }, [iconSearchQuery]);

  const handleSelectIcon = (result: ItunesResult) => {
    setSelectedIcon(result);
    setIconPreview(result.artworkUrl512 || result.artworkUrl100);
    if (!appName) setAppName(result.trackName);
    setIconSearchResults([]);
  };

  const handleDirectIcon = (f: File) => {
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
    setSelectedIcon(null);
  };

  const handlePartImages = async (i: number, fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setParts(prev => prev.map((p, idx) => idx === i
      ? { ...p, files: [...p.files, ...newFiles], previews: [...p.previews, ...newPreviews] }
      : p
    ));

    // 첫 번째 이미지 업로드 시 색상 자동 추출
    if (newFiles.length > 0 && dominantColors.length === 0) {
      setExtractingColors(true);
      const colors = await extractColorsFromFile(newFiles[0]);
      setDominantColors(colors);
      setExtractingColors(false);
    }
  };

  const toggleUiPattern = (pattern: string) => {
    setSelectedUiPatterns(prev =>
      prev.includes(pattern) ? prev.filter(p => p !== pattern) : [...prev, pattern]
    );
  };

  const addPart = () => setParts(prev => [...prev, { partName: "", showDropdown: false, files: [], previews: [] }]);
  const removePart = (i: number) => setParts(prev => prev.filter((_, idx) => idx !== i));
  const updatePartName = (i: number, value: string) => setParts(prev => prev.map((p, idx) => idx === i ? { ...p, partName: value, showDropdown: false } : p));
  const toggleDropdown = (i: number) => setParts(prev => prev.map((p, idx) => idx === i ? { ...p, showDropdown: !p.showDropdown } : { ...p, showDropdown: false }));
  const removePartImage = (pi: number, ii: number) => setParts(prev => prev.map((p, idx) => idx === pi ? { ...p, files: p.files.filter((_, i) => i !== ii), previews: p.previews.filter((_, i) => i !== ii) } : p));
  const movePart = (from: number, to: number) => setParts(prev => { const next = [...prev]; const [m] = next.splice(from, 1); next.splice(to, 0, m); return next; });

  const handleSubmit = async () => {
    if (!appName.trim()) return setError("앱 이름을 입력해주세요.");
    if (parts.every(p => p.files.length === 0)) return setError("이미지를 최소 1개 추가해주세요.");
    setLoading(true); setError("");

    try {
      let iconUrl: string | null = null;
      let storeIconUrl: string | null = null;
      let bundleId: string | null = null;
      let storeCategory: string | null = null;

      if (selectedIcon) {
        storeIconUrl = selectedIcon.artworkUrl512 || selectedIcon.artworkUrl100;
        bundleId = selectedIcon.bundleId;
        iconUrl = storeIconUrl;
        storeCategory = selectedIcon.primaryGenreName || null;
      } else if (iconFile) {
        const ext = iconFile.name.split(".").pop();
        const iconName = `icons/${Date.now()}_icon.${ext}`;
        await supabase.storage.from("images").upload(iconName, iconFile);
        const { data } = supabase.storage.from("images").getPublicUrl(iconName);
        iconUrl = data.publicUrl;
      }

      const { data: appData, error: appErr } = await supabase.from("apps").insert({
        name: appName.trim(),
        description: description.trim(),
        category: genre,
        genre,
        ui_pattern: selectedUiPatterns,
        dominant_colors: dominantColors,
        icon_url: iconUrl,
        store_icon_url: storeIconUrl,
        bundle_id: bundleId,
        store_category: storeCategory,
      }).select().single();
      if (appErr) throw appErr;

      for (let pi = 0; pi < parts.length; pi++) {
        const part = parts[pi];
        if (part.files.length === 0) continue;
        const { data: partData, error: partErr } = await supabase.from("app_parts").insert({
          app_id: appData.id, part_name: part.partName.trim() || `파트 ${pi + 1}`, sort_order: pi
        }).select().single();
        if (partErr) throw partErr;
        for (let ii = 0; ii < part.files.length; ii++) {
          const file = part.files[ii];
          const ext = file.name.split(".").pop();
          const fileName = `apps/${appData.id}/${partData.id}/${Date.now()}_${ii}.${ext}`;
          await supabase.storage.from("images").upload(fileName, file);
          const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
          await supabase.from("app_images").insert({ part_id: partData.id, app_id: appData.id, image_url: urlData.publicUrl, sort_order: ii });
        }
      }

      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.message || "등록 중 오류가 발생했어요.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1c]">
          <h2 className="font-bold text-lg text-[#f0f0f0]">새 앱 등록</h2>
          <button onClick={onClose} className="text-[#666666] hover:text-[#b8b8b8]"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[82vh] overflow-y-auto">
          {/* 아이콘 검색 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono text-[#666666] uppercase tracking-wider">앱 아이콘</p>
              <button onClick={() => { setUseDirectUpload(!useDirectUpload); setIconPreview(null); setSelectedIcon(null); }}
                className="text-xs text-[#666666] hover:text-[#c8ff00] transition-colors underline">
                {useDirectUpload ? "앱스토어 검색" : "직접 업로드"}
              </button>
            </div>

            {!useDirectUpload ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="text" value={iconSearchQuery} onChange={(e) => setIconSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchItunes()}
                    placeholder="앱 이름으로 검색 (예: 카카오톡, 올리브영)"
                    className="flex-1 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#d4d4d4] placeholder-[#666666] focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
                  />
                  <button onClick={searchItunes} disabled={iconSearching}
                    className="px-4 py-2 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-[#999999] hover:border-[#c8ff00] hover:text-[#c8ff00] transition-all">
                    {iconSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  </button>
                </div>
                {iconSearchResults.length > 0 && (
                  <div className="grid grid-cols-6 gap-2 p-3 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl">
                    {iconSearchResults.map((result, i) => (
                      <button key={i} onClick={() => handleSelectIcon(result)} className="flex flex-col items-center gap-1 group">
                        <img src={result.artworkUrl100} alt={result.trackName} className="w-12 h-12 rounded-xl object-cover border-2 border-transparent group-hover:border-[#c8ff00] transition-all" />
                        <span className="text-[9px] text-[#666666] group-hover:text-[#c8ff00] text-center line-clamp-1 w-full">{result.trackName}</span>
                      </button>
                    ))}
                  </div>
                )}
                {iconPreview && (
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl">
                    <img src={iconPreview} alt="icon" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm text-[#d4d4d4]">{selectedIcon?.trackName || "선택된 아이콘"}</p>
                      <p className="text-xs text-[#666666] font-mono">
                        {selectedIcon?.primaryGenreName && <span className="text-[#c8ff00]">{selectedIcon.primaryGenreName} · </span>}
                        {selectedIcon ? "앱스토어 아이콘 (자동 업데이트)" : "직접 업로드"}
                      </p>
                    </div>
                    <button onClick={() => { setIconPreview(null); setSelectedIcon(null); }} className="ml-auto text-[#666666] hover:text-[#ff4d3d]"><X size={14} /></button>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => iconRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#3d3d3d] hover:border-[#c8ff00]/50 cursor-pointer overflow-hidden flex items-center justify-center transition-all">
                {iconPreview ? <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-1 text-[#666666]"><ImagePlus size={20} /><span className="text-[10px]">아이콘</span></div>}
                <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleDirectIcon(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* 앱 기본 정보 */}
          <div className="flex gap-3">
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="앱 이름 *"
              className="flex-1 bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#d4d4d4] placeholder-[#666666] focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
            />
            <select value={genre} onChange={(e) => setGenre(e.target.value)}
              className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#d4d4d4] focus:outline-none focus:border-[#c8ff00]/50 transition-colors">
              {GENRES.filter(g => g.id !== "all").map(g => <option key={g.id} value={g.id} className="bg-[#1c1c1c]">{g.label}</option>)}
            </select>
          </div>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="간단한 설명 (선택)"
            className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#d4d4d4] placeholder-[#666666] focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
          />

          {/* UI 패턴 선택 */}
          <div>
            <p className="text-xs font-mono text-[#666666] uppercase tracking-wider mb-2">UI 패턴 (복수 선택)</p>
            <div className="flex flex-wrap gap-1.5">
              {UI_PATTERNS.map(p => (
                <button key={p} onClick={() => toggleUiPattern(p)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs transition-all border",
                    selectedUiPatterns.includes(p)
                      ? "bg-[#c8ff00] text-[#0a0a0a] border-[#c8ff00] font-medium"
                      : "bg-transparent text-[#999999] border-[#3d3d3d] hover:border-[#666666] hover:text-[#d4d4d4]"
                  )}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 파트 목록 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-[#666666] uppercase tracking-wider">파트 구성</p>
              <button onClick={addPart} className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-[#999999] hover:border-[#c8ff00] hover:text-[#c8ff00] transition-all">
                <Plus size={12} /> 파트 추가
              </button>
            </div>

            {parts.map((part, pi) => (
              <div key={pi} className="border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3 bg-[#1c1c1c]/50">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => pi > 0 && movePart(pi, pi - 1)} disabled={pi === 0} className="text-[10px] text-[#3d3d3d] hover:text-[#c8ff00] disabled:opacity-20 leading-none">▲</button>
                    <button onClick={() => pi < parts.length - 1 && movePart(pi, pi + 1)} disabled={pi === parts.length - 1} className="text-[10px] text-[#3d3d3d] hover:text-[#c8ff00] disabled:opacity-20 leading-none">▼</button>
                  </div>
                  <div className="relative flex-1">
                    <div className="flex">
                      <input type="text" value={part.partName} onChange={(e) => updatePartName(pi, e.target.value)}
                        placeholder="파트명 (예: 로그인, 홈, 마이페이지)"
                        className="flex-1 bg-[#1c1c1c] border border-[#3d3d3d] rounded-l-lg px-3 py-2 text-sm text-[#d4d4d4] placeholder-[#666666] focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
                      />
                      <button onClick={() => toggleDropdown(pi)} className="bg-[#1c1c1c] border border-l-0 border-[#3d3d3d] rounded-r-lg px-2.5 text-[#666666] hover:text-[#c8ff00] transition-all">
                        <ChevronDown size={13} className={cn("transition-transform", part.showDropdown && "rotate-180")} />
                      </button>
                    </div>
                    {part.showDropdown && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
                        <div className="grid grid-cols-4 gap-0 max-h-48 overflow-y-auto p-1">
                          {PART_NAME_PRESETS.map(preset => (
                            <button key={preset} onClick={() => updatePartName(pi, preset)}
                              className="text-center px-2 py-1.5 text-xs text-[#999999] hover:bg-[#2a2a2a] hover:text-[#c8ff00] rounded transition-colors">{preset}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {parts.length > 1 && (
                    <button onClick={() => removePart(pi)} className="text-[#3d3d3d] hover:text-[#ff4d3d] transition-colors shrink-0"><Trash2 size={14} /></button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {part.previews.map((preview, ii) => (
                    <div key={ii} className="relative group w-14">
                      <img src={preview} alt="" className="w-14 aspect-[9/16] object-cover rounded-lg" />
                      <button onClick={() => removePartImage(pi, ii)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-[#0a0a0a] border border-[#3d3d3d] rounded-full flex items-center justify-center text-[#666666] hover:text-[#ff4d3d] opacity-0 group-hover:opacity-100 transition-all">
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => imageRefs.current[pi]?.click()}
                    className="w-14 aspect-[9/16] border-2 border-dashed border-[#3d3d3d] rounded-lg flex items-center justify-center hover:border-[#c8ff00]/50 transition-all cursor-pointer">
                    <Plus size={16} className="text-[#3d3d3d]" />
                  </button>
                  <input ref={el => { imageRefs.current[pi] = el; }} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => e.target.files && handlePartImages(pi, e.target.files)} />
                </div>
                {part.files.length > 0 && <p className="text-[11px] text-[#666666] font-mono">{part.files.length}장 선택됨</p>}
              </div>
            ))}
          </div>

          {/* 추출된 색상 미리보기 */}
          {(dominantColors.length > 0 || extractingColors) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette size={13} className="text-[#666666]" />
                <p className="text-xs font-mono text-[#666666] uppercase tracking-wider">추출된 대표 색상</p>
                {extractingColors && <Loader2 size={12} className="text-[#c8ff00] animate-spin" />}
              </div>
              <div className="flex gap-2 flex-wrap">
                {dominantColors.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md border border-[#3d3d3d]" style={{ backgroundColor: color }} />
                    <span className="text-[11px] font-mono text-[#666666]">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-[#ff4d3d] bg-[#ff4d3d]/10 border border-[#ff4d3d]/20 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className={cn("w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
              loading ? "bg-[#c8ff00]/50 text-[#0a0a0a]/50 cursor-not-allowed" : "bg-[#c8ff00] text-[#0a0a0a] hover:bg-[#c8ff00]/90"
            )}>
            {loading ? <><Loader2 size={15} className="animate-spin" />등록 중...</> : <><Upload size={15} />등록하기</>}
          </button>
        </div>
      </div>
    </div>
  );
}
