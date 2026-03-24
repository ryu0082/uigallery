"use client";

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, ImagePlus, Loader2, Plus, Trash2, ChevronDown, Search, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "navigation", "hero", "cards", "forms", "dashboard",
  "mobile", "ecommerce", "landing", "typography"
];

const PART_NAME_PRESETS = [
  "온보딩", "스플래시", "로그인", "회원가입", "홈", "메인",
  "검색", "상세", "목록", "마이페이지", "설정", "알림",
  "결제", "장바구니", "리뷰", "채팅", "프로필", "랭킹",
  "대시보드", "통계", "공지사항", "이벤트", "튜토리얼", "에러", "쇼핑", "피드",
];

interface ItunesResult {
  trackName: string;
  artworkUrl100: string;
  artworkUrl512: string;
  bundleId: string;
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

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("mobile");

  // 아이콘 관련
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [iconSearchResults, setIconSearchResults] = useState<ItunesResult[]>([]);
  const [iconSearching, setIconSearching] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<ItunesResult | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [useDirectUpload, setUseDirectUpload] = useState(false);

  const [parts, setParts] = useState<PartEntry[]>([
    { partName: "", showDropdown: false, files: [], previews: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const iconRef = useRef<HTMLInputElement>(null);
  const imageRefs = useRef<(HTMLInputElement | null)[]>([]);

  // iTunes 검색
  const searchItunes = useCallback(async () => {
    if (!iconSearchQuery.trim()) return;
    setIconSearching(true);
    setIconSearchResults([]);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(iconSearchQuery)}&entity=software&limit=6&country=kr`
      );
      const data = await res.json();
      setIconSearchResults(data.results || []);
    } catch {
      setIconSearchResults([]);
    } finally {
      setIconSearching(false);
    }
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

  const addPart = () => {
    setParts(prev => [...prev, { partName: "", showDropdown: false, files: [], previews: [] }]);
  };

  const removePart = (i: number) => {
    setParts(prev => prev.filter((_, idx) => idx !== i));
  };

  const updatePartName = (i: number, value: string) => {
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, partName: value, showDropdown: false } : p));
  };

  const toggleDropdown = (i: number) => {
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, showDropdown: !p.showDropdown } : { ...p, showDropdown: false }));
  };

  const handlePartImages = (i: number, fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setParts(prev => prev.map((p, idx) => idx === i
      ? { ...p, files: [...p.files, ...newFiles], previews: [...p.previews, ...newPreviews] }
      : p
    ));
  };

  const removePartImage = (partIdx: number, imgIdx: number) => {
    setParts(prev => prev.map((p, idx) => idx === partIdx
      ? { ...p, files: p.files.filter((_, i) => i !== imgIdx), previews: p.previews.filter((_, i) => i !== imgIdx) }
      : p
    ));
  };

  // 파트 순서 변경
  const movePart = (from: number, to: number) => {
    setParts(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!appName.trim()) return setError("앱 이름을 입력해주세요.");
    if (parts.every(p => p.files.length === 0)) return setError("이미지를 최소 1개 추가해주세요.");

    setLoading(true);
    setError("");

    try {
      // 아이콘 처리
      let iconUrl: string | null = null;
      let storeIconUrl: string | null = null;
      let bundleId: string | null = null;

      if (selectedIcon) {
        // iTunes 아이콘 URL 저장 (자동 업데이트용)
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

      // 앱 등록
      const { data: appData, error: appErr } = await supabase
        .from("apps")
        .insert({
          name: appName.trim(),
          description: description.trim(),
          category,
          icon_url: iconUrl,
          store_icon_url: storeIconUrl,
          bundle_id: bundleId,
        })
        .select().single();
      if (appErr) throw appErr;

      // 파트 + 이미지 등록
      for (let pi = 0; pi < parts.length; pi++) {
        const part = parts[pi];
        if (part.files.length === 0) continue;

        const { data: partData, error: partErr } = await supabase
          .from("app_parts")
          .insert({ app_id: appData.id, part_name: part.partName.trim() || `파트 ${pi + 1}`, sort_order: pi })
          .select().single();
        if (partErr) throw partErr;

        for (let ii = 0; ii < part.files.length; ii++) {
          const file = part.files[ii];
          const ext = file.name.split(".").pop();
          const fileName = `apps/${appData.id}/${partData.id}/${Date.now()}_${ii}.${ext}`;
          await supabase.storage.from("images").upload(fileName, file);
          const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
          await supabase.from("app_images").insert({
            part_id: partData.id,
            app_id: appData.id,
            image_url: urlData.publicUrl,
            sort_order: ii,
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "업로드 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-800">
          <h2 className="font-display text-lg text-ink-100">새 앱 등록</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-300"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-6 max-h-[82vh] overflow-y-auto">

          {/* 아이콘 검색 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono text-ink-500 uppercase tracking-wider">앱 아이콘</p>
              <button
                onClick={() => setUseDirectUpload(!useDirectUpload)}
                className="text-xs text-ink-500 hover:text-acid transition-colors underline"
              >
                {useDirectUpload ? "앱스토어에서 검색" : "직접 업로드"}
              </button>
            </div>

            {!useDirectUpload ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchItunes()}
                    placeholder="앱 이름으로 검색 (예: 카카오톡)"
                    className="flex-1 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-acid/50 transition-colors"
                  />
                  <button
                    onClick={searchItunes}
                    disabled={iconSearching}
                    className="px-4 py-2 bg-ink-700 border border-ink-600 rounded-lg text-ink-300 hover:border-acid hover:text-acid transition-all"
                  >
                    {iconSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  </button>
                </div>

                {/* 검색 결과 */}
                {iconSearchResults.length > 0 && (
                  <div className="grid grid-cols-6 gap-2 p-3 bg-ink-800 border border-ink-700 rounded-xl">
                    {iconSearchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectIcon(result)}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <img
                          src={result.artworkUrl100}
                          alt={result.trackName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-transparent group-hover:border-acid transition-all"
                        />
                        <span className="text-[9px] text-ink-500 group-hover:text-acid text-center line-clamp-1 w-full">
                          {result.trackName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 선택된 아이콘 미리보기 */}
                {iconPreview && (
                  <div className="flex items-center gap-3 p-3 bg-ink-800 border border-ink-700 rounded-xl">
                    <img src={iconPreview} alt="icon" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm text-ink-200">{selectedIcon?.trackName || "선택된 아이콘"}</p>
                      <p className="text-xs text-ink-500 font-mono">
                        {selectedIcon ? "앱스토어 아이콘 (자동 업데이트)" : "직접 업로드"}
                      </p>
                    </div>
                    <button onClick={() => { setIconPreview(null); setSelectedIcon(null); }} className="ml-auto text-ink-600 hover:text-coral">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => iconRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-ink-700 hover:border-acid/50 cursor-pointer overflow-hidden flex items-center justify-center transition-all"
              >
                {iconPreview
                  ? <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-1 text-ink-600"><ImagePlus size={20} /><span className="text-[10px]">아이콘</span></div>
                }
                <input ref={iconRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleDirectIcon(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* 앱 기본 정보 */}
          <div className="flex gap-3">
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)}
              placeholder="앱 이름 *"
              className="flex-1 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-acid/50 transition-colors"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 focus:outline-none focus:border-acid/50 transition-colors"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-ink-800">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="간단한 설명"
            className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-acid/50 transition-colors"
          />

          {/* 파트 목록 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-ink-500 uppercase tracking-wider">파트 구성</p>
              <button onClick={addPart}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-ink-800 border border-ink-700 rounded-lg text-ink-300 hover:border-acid hover:text-acid transition-all"
              >
                <Plus size={12} /> 파트 추가
              </button>
            </div>

            {parts.map((part, pi) => (
              <div key={pi} className="border border-ink-700 rounded-xl p-4 flex flex-col gap-3 bg-ink-800/50">
                <div className="flex items-center gap-2">
                  {/* 순서 변경 버튼 */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => pi > 0 && movePart(pi, pi - 1)} className="text-ink-600 hover:text-acid disabled:opacity-20" disabled={pi === 0}>▲</button>
                    <button onClick={() => pi < parts.length - 1 && movePart(pi, pi + 1)} className="text-ink-600 hover:text-acid disabled:opacity-20" disabled={pi === parts.length - 1}>▼</button>
                  </div>

                  <div className="relative flex-1">
                    <div className="flex">
                      <input
                        type="text"
                        value={part.partName}
                        onChange={(e) => updatePartName(pi, e.target.value)}
                        placeholder="파트명 (예: 로그인, 홈, 마이페이지)"
                        className="flex-1 bg-ink-800 border border-ink-700 rounded-l-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-acid/50 transition-colors"
                      />
                      <button onClick={() => toggleDropdown(pi)}
                        className="bg-ink-800 border border-l-0 border-ink-700 rounded-r-lg px-2.5 text-ink-500 hover:text-acid transition-all"
                      >
                        <ChevronDown size={13} className={cn("transition-transform", part.showDropdown && "rotate-180")} />
                      </button>
                    </div>
                    {part.showDropdown && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-ink-800 border border-ink-700 rounded-lg shadow-xl overflow-hidden">
                        <div className="grid grid-cols-4 gap-0 max-h-48 overflow-y-auto p-1">
                          {PART_NAME_PRESETS.map(preset => (
                            <button key={preset} onClick={() => updatePartName(pi, preset)}
                              className="text-center px-2 py-1.5 text-xs text-ink-300 hover:bg-ink-700 hover:text-acid rounded transition-colors"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {parts.length > 1 && (
                    <button onClick={() => removePart(pi)} className="text-ink-600 hover:text-coral transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* 이미지들 */}
                <div className="flex gap-2 flex-wrap">
                  {part.previews.map((preview, ii) => (
                    <div key={ii} className="relative group w-14">
                      <img src={preview} alt="" className="w-14 aspect-[9/16] object-cover rounded-lg" />
                      <button onClick={() => removePartImage(pi, ii)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-ink-950 border border-ink-700 rounded-full flex items-center justify-center text-ink-400 hover:text-coral opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => imageRefs.current[pi]?.click()}
                    className="w-14 aspect-[9/16] border-2 border-dashed border-ink-700 rounded-lg flex items-center justify-center hover:border-acid/50 transition-all cursor-pointer"
                  >
                    <Plus size={16} className="text-ink-600" />
                  </button>
                  <input
                    ref={el => { imageRefs.current[pi] = el; }}
                    type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => e.target.files && handlePartImages(pi, e.target.files)}
                  />
                </div>
                {part.files.length > 0 && (
                  <p className="text-[11px] text-ink-500 font-mono">{part.files.length}장 선택됨</p>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-xs text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
              loading ? "bg-acid/50 text-ink-950/50 cursor-not-allowed" : "bg-acid text-ink-950 hover:bg-acid/90"
            )}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" />등록 중...</> : <><Upload size={15} />등록하기</>}
          </button>
        </div>
      </div>
    </div>
  );
}
