"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, ImagePlus, Loader2, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PART_NAME_PRESETS = [
  "온보딩", "스플래시", "로그인", "회원가입", "홈", "메인",
  "검색", "상세", "목록", "마이페이지", "설정", "알림",
  "결제", "장바구니", "리뷰", "채팅", "프로필", "랭킹",
  "대시보드", "통계", "공지사항", "이벤트", "튜토리얼", "에러", "쇼핑", "피드",
];

interface AddPartModalProps {
  appId: string;
  appName: string;
  currentPartCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPartModal({ appId, appName, currentPartCount, onClose, onSuccess }: AddPartModalProps) {
  const [partName, setPartName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!partName.trim()) return setError("파트명을 입력해주세요.");
    if (files.length === 0) return setError("이미지를 최소 1개 추가해주세요.");

    setLoading(true);
    setError("");

    try {
      const { data: partData, error: partErr } = await supabase
        .from("app_parts")
        .insert({ app_id: appId, part_name: partName.trim(), sort_order: currentPartCount })
        .select().single();
      if (partErr) throw partErr;

      for (let ii = 0; ii < files.length; ii++) {
        const file = files[ii];
        const ext = file.name.split(".").pop();
        const fileName = `apps/${appId}/${partData.id}/${Date.now()}_${ii}.${ext}`;
        await supabase.storage.from("images").upload(fileName, file);
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
        await supabase.from("app_images").insert({
          part_id: partData.id,
          app_id: appId,
          image_url: urlData.publicUrl,
          sort_order: ii,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "등록 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-800">
          <div>
            <h2 className="font-display text-lg text-ink-100">파트 추가</h2>
            <p className="text-xs text-ink-500 font-mono mt-0.5">{appName}</p>
          </div>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-300"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* 파트명 */}
          <div className="relative">
            <div className="flex">
              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="파트명 입력 (예: 쇼핑, 피드)"
                className="flex-1 bg-ink-800 border border-ink-700 rounded-l-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-acid/50 transition-colors"
              />
              <button onClick={() => setShowDropdown(!showDropdown)}
                className="bg-ink-800 border border-l-0 border-ink-700 rounded-r-lg px-2.5 text-ink-500 hover:text-acid transition-all"
              >
                <ChevronDown size={13} className={cn("transition-transform", showDropdown && "rotate-180")} />
              </button>
            </div>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-ink-800 border border-ink-700 rounded-lg shadow-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 max-h-48 overflow-y-auto p-1">
                  {PART_NAME_PRESETS.map(preset => (
                    <button key={preset} onClick={() => { setPartName(preset); setShowDropdown(false); }}
                      className="text-center px-2 py-1.5 text-xs text-ink-300 hover:bg-ink-700 hover:text-acid rounded transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 이미지 */}
          <div className="flex gap-2 flex-wrap">
            {previews.map((preview, i) => (
              <div key={i} className="relative group w-14">
                <img src={preview} alt="" className="w-14 aspect-[9/16] object-cover rounded-lg" />
                <button onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-ink-950 border border-ink-700 rounded-full flex items-center justify-center text-ink-400 hover:text-coral opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-14 aspect-[9/16] border-2 border-dashed border-ink-700 rounded-lg flex items-center justify-center hover:border-acid/50 transition-all cursor-pointer"
            >
              <Plus size={16} className="text-ink-600" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {files.length > 0 && <p className="text-[11px] text-ink-500 font-mono">{files.length}장 선택됨</p>}

          {error && <p className="text-xs text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
              loading ? "bg-acid/50 text-ink-950/50 cursor-not-allowed" : "bg-acid text-ink-950 hover:bg-acid/90"
            )}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" />등록 중...</> : <><Upload size={15} />파트 추가하기</>}
          </button>
        </div>
      </div>
    </div>
  );
}
