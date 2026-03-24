"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeroSection } from "@/components/gallery/HeroSection";
import { Toolbar } from "@/components/gallery/Toolbar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-ink-950">
      <Header onUploadSuccess={() => setRefreshKey(k => k + 1)} />
      <div className="flex pt-14">
        <Sidebar />
        <main className="flex-1 min-w-0 px-6 py-0">
          <HeroSection />
          <Toolbar />
          <GalleryGrid refreshKey={refreshKey} />
          <div className="h-20" />
        </main>
      </div>
    </div>
  );
}
