"use client";

import { Zap } from "lucide-react";

const stats = [
  { value: "2,400+", label: "컴포넌트" },
  { value: "148", label: "기여자" },
  { value: "39k", label: "다운로드" },
  { value: "14", label: "카테고리" },
];

export function HeroSection() {
  return (
    <div className="relative py-10 px-1 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#c8ff00]/10 border border-[#c8ff00]/20 rounded-full">
            <Zap size={11} className="text-[#c8ff00]" fill="currentColor" />
            <span className="text-[11px] font-mono text-[#c8ff00] uppercase tracking-wider">
              디자인 레퍼런스 갤러리
            </span>
          </div>
        </div>

        <h1 className="font-bold text-4xl md:text-5xl text-[#f0f0f0] leading-tight mb-3 max-w-xl">
          필요한 UI 패턴을
          <br />
          <span className="text-[#c8ff00]">빠르게 찾아보세요.</span>
        </h1>

        <p className="text-[#999999] text-sm max-w-md leading-relaxed mb-8">
          UIUX 디자이너를 위한 모바일 앱 레퍼런스 갤러리.
          장르, 패턴, 컬러로 검색하고 바로 활용하세요.
        </p>

        <div className="flex gap-6 flex-wrap">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <span className="font-bold text-xl text-[#f0f0f0]">{s.value}</span>
              <span className="text-[11px] font-mono text-[#666666] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
