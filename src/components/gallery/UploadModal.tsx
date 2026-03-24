"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, ImagePlus, Loader2, Plus, Trash2, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENRES, UI_PATTERNS } from "@/types";

// iTunes 카테고리 → 한글 장르 매핑
const ITUNES_GENRE_MAP: Record<string, string> = {
  "Games": "게임",
  "Finance": "금융/핀테크",
  "Shopping": "커머스/쇼핑",
  "Social Networking": "소셜/커뮤니티",
  "Health & Fitness": "헬스/피트니스",
  "Travel": "여행/지도",
  "Food & Drink": "음식/배달",
  "Education": "교육",
  "Entertainment": "엔터테인먼트",
  "Utilities": "유틸리티",
  "Lifestyle": "유틸리티",
  "Sports": "스포츠",
  "Business": "금융/핀테크",
  "News": "소셜/커뮤니티",
  "Music": "엔터테인먼트",
  "Photo & Video": "엔터테인먼트",
  "Medical": "헬스/피트니스",
  "Navigation": "여행/지도",
  "Books": "교육",
  "Reference": "교육",
  "Productivity": "유틸리티",
  "Weather": "유틸리티",
  "Catalogs": "커머스/쇼핑",
  "Magazines & Newspapers": "소셜/커뮤니티",
  "Kids": "교육",
};

function mapItunesGenre(itunesGenre: string): string {
  return ITUNES_GENRE_MAP[itunesGenre] || "유틸리티";
}

// 15개 컬러칩
const COLOR_CHIPS = [
  { id: "black",       label: "블랙",       hex: "#111111" },
  { id: "darkgray",    label: "다크그레이",  hex: "#555555" },
  { id: "gray",        label: "그레이",      hex: "#999999" },
  { id: "lightgray",   label: "라이트그레이",hex: "#cccccc" },
  { id: "white",       label: "화이트",      hex: "#f5f5f5" },
  { id: "red",         label: "레드",        hex: "#e53935" },
  { id: "orange",      label: "오렌지",      hex: "#fb8c00" },
  { id: "yellow",      label: "옐로우",      hex: "#fdd835" },
  { id: "lightgreen",  label: "라이트그린",  hex: "#8bc34a" },
  { id: "green",       label: "그린",        hex: "#2e7d32" },
  { id: "teal",        label: "틸/민트",     hex: "#00897b" },
  { id: "blue",        label: "블루",        hex: "#1e88e5" },
  { id: "navy",        label: "네이비",      hex: "#1a237e" },
  { id: "purple",      label: "퍼플",        hex: "#7b1fa2" },
  { id: "pink",        label: "핑크",        hex: "#e91e8c" },
];

// RGB → 가장 가까운 컬러칩 찾기
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function colorDist(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function matchColorChip(hex: string): string {
  const rgb = hexToRgb(hex);
  let minDist = Infinity;
  let matched = COLOR_CHIPS[0].id;
  for (const chip of COLOR_CHIPS) {
    const chipRgb = hexToRgb(chip.hex);
    const d = colorDist(rgb, chipRgb);
    if (d < minDist) { minDist = d; matched = chip.id; }
  }
  return matched;
}

// 이미지에서 대표 색상 추출 후 컬러칩 매핑
async function extractColorChipsFromFile(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 80; canvas.height = 80;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 80, 80);
        const data = ctx.getImageData(0, 0, 80, 80).data;

        // 픽셀 샘플링 → 평균 색상 3개 추출 (상단/중단/하단 영역)
        const zones = [
          { start: 0, end: 80 * 20 * 4 },       // 상단 25%
          { start: 80 * 30 * 4, end: 80 * 50 * 4 }, // 중간
          { start: 80 * 60 * 4, end: 80 * 80 * 4 }, // 하단 25%
        ];

        const hexColors: string[] = [];
        for (const zone of zones) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = zone.start; i < zone.end; i += 16) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 20 && brightness < 235) { // 너무 어둡거나 밝은 건 제외
              r += data[i]; g += data[i + 1]; b += data[i + 2];
              count++;
            }
          }
          if (count > 0) {
            const toHex = (v: number) => Math.round(v / count).toString(16).padStart(2, "0");
            hexColors.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
          }
        }

        // 컬러칩 매핑 + 중복 제거
        const chips = [...new Set(hexColors.map(matchColorChip))];
        resolve(chips.slice(0, 3));
      } catch { resolve([]); }
    };
    img.onerror = () => resolve([]);
    img.src = URL.createObjectURL(file);
  });
}

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
  const [genre, setGenre] = useState("게임");
  const [genreFromStore, setGenreFromStore] = useState(false); // 스토어에서 자동 설정됐는지

  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [iconSearchResults, setIconSearchResults] = useState<ItunesResult[]>([]);
  const [iconSearching, setIconSearching] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<ItunesResult | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [useDirectUpload, setUseDirectUpload] = useState(false);
  const [storeSearched, setStoreSearched] = useState(false); // 검색 시도했는지

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
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
    setStoreSearched(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(iconSearchQuery)}&entity=software&limit=6&country=kr`);
      const data = await res.json();
      setIconSearchResults(data.results || []);
      if ((data.results || []).length === 0) setGenreFromStore(false);
    } catch { setIconSearchResults([]); }
    finally { setIconSearching(false); }
  }, [iconSearchQuery]);

  const handleSelectIcon = (result: ItunesResult) => {
    setSelectedIcon(result);
    setIconPreview(result.artworkUrl512 || result.artworkUrl100);
    if (!appName) setAppName(result.trackName);
    const mappedGenre = mapItunesGenre(result.primaryGenreName);
    setGenre(mappedGenre);
    setGenreFromStore(true);
    setIconSearchResults([]);
  };

  const handleDirectIcon = (f: File) => {
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
    setSelectedIcon(null);
    setGenreFromStore(false);
  };

  const handlePartImages = async (i: number, fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setParts(prev => prev.map((p, idx) => idx === i
      ? { ...p, files: [...p.files, ...newFiles], previews: [...p.previews, ...newPreviews] }
      : p
    ));
    // 첫 이미지 추가 시 색상 자동 추출
    if (newFiles.length > 0 && selectedColors.length === 0) {
      setExtractingColors(true);
      const chips = await extractColorChipsFromFile(newFiles[0]);
      setSelectedColors(chips);
      setExtractingColors(false);
    }
  };

  const toggleColor = (chipId: string) => {
    setSelectedColors(prev =>
      prev.includes(chipId) ? prev.filter(c => c !== chipId) : [...prev, chipId]
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

      if (selectedIcon) {
        storeIconUrl = selectedIcon.artworkUrl512 || selectedIcon.artworkUrl100;
        bundleId = selectedIcon.bundleId;
        iconUrl = storeIconUrl;
      } else if (iconFile) {
        const ext = iconFile.name.split(".").pop();
        const iconName = `icons/${Date.now()}_icon.${ext}`;
        await supabase.storage.from("images").upload(iconName, iconFile);
        const { data } = supabase.storage.from("images").getPublicUrl(iconName);
        iconUrl = data.publicUrl;
      }

      // 파트명에서 UI 패턴 자동 추출
      const uiPatterns = parts
        .map(p => p.partName.trim())
        .filter(name => UI_PATTERNS.includes(name));
      const uniquePatterns = [...new Set(uiPatterns)];

      const { data: appData, error: appErr } = await supabase.from("apps").insert({
        name: appName.trim(),
        category: genre,
        genre,
        ui_pattern: uniquePatterns,
        dominant_colors: selectedColors,
        icon_url: iconUrl,
        store_icon_url: storeIconUrl,
        bundle_id: bundleId,
        store_category: selectedIcon?.primaryGenreName || null,
      }).select().single();
      if (appErr) throw appErr;

      for (let pi = 0; pi < parts.length; pi++) {
        const part = parts[pi];
        if (part.files.length === 0) continue;
        const { data: partData, error: partErr } = await supabase.from("app_parts").insert({
          app_id: appData.id,
          part_name: part.partName.trim() || `파트 ${pi + 1}`,
          sort_order: pi,
        }).select().single();
        if (partErr) throw partErr;
        for (let ii = 0; ii < part.files.length; ii++) {
          const file = part.files[ii];
          const ext = file.name.split(".").pop();
          const fileName = `apps/${appData.id}/${partData.id}/${Date.now()}_${ii}.${ext}`;
          await supabase.storage.from("images").upload(fileName, file);
          const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
          await supabase.from("app_images").insert({
            part_id: partData.id, app_id: appData.id,
            image_url: urlData.publicUrl, sort_order: ii,
          });
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
              <p className="text-xs text-[#666666] uppercase tracking-wider">앱 아이콘</p>
              <button onClick={() => { setUseDirectUpload(!useDirectUpload); setIconPreview(null); setSelectedIcon(null); setGenreFromStore(false); setStoreSearched(false); }}
                className="text-xs text-[#666666] hover:text-[#c8ff00] transition-colors underline">
                {useDirectUpload ? "앱스토어 검색" : "직접 업로드"}
              </button>
            </div>

            {!useDirectUpload ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="text" value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
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
                        <img src={result.artworkUrl100} alt={result.trackName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-transparent group-hover:border-[#c8ff00] transition-all" />
                        <span className="text-[9px] text-[#666666] group-hover:text-[#c8ff00] text-center line-clamp-1 w-full">{result.trackName}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 검색했는데 결과 없으면 안내 */}
                {storeSearched && iconSearchResults.length === 0 && !iconSearching && (
                  <div className="p-3 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl text-center">
                    <p className="text-xs text-[#666666]">앱스토어에서 찾을 수 없어요.</p>
                    <button onClick={() => setUseDirectUpload(true)} className="text-xs text-[#c8ff00] underline mt-1">직접 업로드로 전환</button>
                  </div>
                )}

                {iconPreview && (
                  <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl">
                    <img src={iconPreview} alt="icon" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm text-[#d4d4d4]">{selectedIcon?.trackName}</p>
                      <p className="text-xs text-[#666666]">
                        장르: <span className="text-[#c8ff00]">{genre}</span> · 앱스토어 아이콘 자동 업데이트
                      </p>
                    </div>
                    <button onClick={() => { setIconPreview(null); setSelectedIcon(null); setGenreFromStore(false); }} className="ml-auto text-[#666666] hover:text-[#ff4d3d]"><X size={14} /></button>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => iconRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#3d3d3d] hover:border-[#c8ff00]/50 cursor-pointer overflow-hidden flex items-center justify-center transition-all">
                {iconPreview
                  ? <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-1 text-[#666666]"><ImagePlus size={20} /><span className="text-[10px]">아이콘</span></div>
                }
                <input ref={iconRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleDirectIcon(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* 앱 이름 */}
          <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="앱 이름 *"
            className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#d4d4d4] placeholder-[#666666] focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
          />

          {/* 장르 — 스토어 검색 성공 시 숨김 */}
          {!genreFromStore && (
            <div>
              <p className="text-xs text-[#666666] uppercase tracking-wider mb-1.5">장르</p>
              <select value={genre} onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#d4d4d4] focus:outline-none focus:border-[#c8ff00]/50 transition-colors">
                {GENRES.filter(g => g.id !== "all").map(g => (
                  <option key={g.id} value={g.id} className="bg-[#1c1c1c]">{g.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* 파트 목록 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] uppercase tracking-wider">파트 구성</p>
                <p className="text-[11px] text-[#555555] mt-0.5">파트명이 UI 패턴 필터와 자동 연결돼요</p>
              </div>
              <button onClick={addPart}
                className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg text-[#999999] hover:border-[#c8ff00] hover:text-[#c8ff00] transition-all">
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
                      <button onClick={() => toggleDropdown(pi)}
                        className="bg-[#1c1c1c] border border-l-0 border-[#3d3d3d] rounded-r-lg px-2.5 text-[#666666] hover:text-[#c8ff00] transition-all">
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
                {part.files.length > 0 && <p className="text-xs text-[#555555]">{part.files.length}장 선택됨</p>}
              </div>
            ))}
          </div>

          {/* 대표 컬러 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-[#666666] uppercase tracking-wider">대표 컬러</p>
              {extractingColors && <Loader2 size={12} className="text-[#c8ff00] animate-spin" />}
              {!extractingColors && selectedColors.length === 0 && (
                <span className="text-xs text-[#555555]">이미지 추가 시 자동 분석돼요</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {COLOR_CHIPS.map(chip => {
                const isSelected = selectedColors.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    onClick={() => toggleColor(chip.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all",
                      isSelected
                        ? "border-[#c8ff00] bg-[#c8ff00]/10 text-[#f0f0f0]"
                        : "border-[#2a2a2a] text-[#666666] hover:border-[#3d3d3d] hover:text-[#999999]"
                    )}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0"
                      style={{ backgroundColor: chip.hex }}
                    />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-[#ff4d3d] bg-[#ff4d3d]/10 border border-[#ff4d3d]/20 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className={cn("w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all",
              loading ? "bg-[#c8ff00]/50 text-[#0a0a0a]/50 cursor-not-allowed" : "bg-[#c8ff00] text-[#0a0a0a] hover:bg-[#c8ff00]/90"
            )}>
            {loading ? <><Loader2 size={15} className="animate-spin" />등록 중...</> : <><Upload size={15} />등록하기</>}
          </button>
        </div>
      </div>
    </div>
  );
}
