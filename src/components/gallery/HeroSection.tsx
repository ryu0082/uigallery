"use client";

import { Zap } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Components" },
  { value: "148", label: "Contributors" },
  { value: "39k", label: "Downloads" },
  { value: "10", label: "Categories" },
];

export function HeroSection() {
  return (
    <div className="relative py-12 px-1 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(var(--ink-400) 1px, transparent 1px), linear-gradient(90deg, var(--ink-400) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Accent blob */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-acid/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Tag */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-acid/10 border border-acid/20 rounded-full">
            <Zap size={11} className="text-acid" fill="currentColor" />
            <span className="text-[11px] font-mono text-acid uppercase tracking-wider">
              Design Reference Gallery
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-5xl text-ink-100 leading-tight mb-3 max-w-xl">
          Find the UI pattern
          <br />
          <span className="text-acid italic">you need, fast.</span>
        </h1>

        <p className="text-ink-400 text-sm max-w-md leading-relaxed mb-8">
          A curated gallery of production-ready UI components and design patterns.
          Search, filter, select, and export in seconds.
        </p>

        {/* Stats */}
        <div className="flex gap-6 flex-wrap">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <span className="font-display text-xl text-ink-100">{s.value}</span>
              <span className="text-[11px] font-mono text-ink-500 uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
