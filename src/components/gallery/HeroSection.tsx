"use client";

export function HeroSection() {
  return (
    <div className="py-6 px-1">
      <div className="flex gap-6 flex-wrap">
        {[
          { value: "2,400+", label: "컴포넌트" },
          { value: "148", label: "기여자" },
          { value: "39k", label: "다운로드" },
          { value: "14", label: "카테고리" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="font-bold text-xl text-[#f0f0f0]">{s.value}</span>
            <span className="text-sm text-[#666666]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
