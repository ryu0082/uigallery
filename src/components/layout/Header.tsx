"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Bell, Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadModal } from "@/components/gallery/UploadModal";
import { AdminLoginModal } from "@/components/gallery/AdminLoginModal";
import { useAdminStore } from "@/lib/adminStore";

export function Header({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { isAdmin, logout } = useAdminStore();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-ink-800 bg-ink-950/90 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-acid flex items-center justify-center">
              <span className="text-ink-950 font-mono font-bold text-xs">UI</span>
            </div>
            <span className="font-display text-lg text-ink-100 tracking-tight">UIVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {["Discover", "Collections", "Popular", "New"].map((item) => (
              <Link key={item} href="#" className="px-3 py-1.5 text-sm text-ink-400 hover:text-ink-100 transition-colors rounded-md hover:bg-ink-800">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button className="hidden md:flex items-center px-3 py-1.5 text-ink-400 hover:text-ink-100 hover:bg-ink-800 rounded-md transition-all">
              <Bell size={14} />
            </button>

            {isAdmin ? (
              <>
                <span className="text-xs font-mono text-acid border border-acid/30 px-2 py-1 rounded-md">관리자</span>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md bg-acid text-ink-950 hover:bg-acid/90 transition-all"
                >
                  <Upload size={13} />
                  <span>Submit</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-1.5 text-ink-400 hover:text-coral hover:bg-ink-800 rounded-md transition-all"
                  title="로그아웃"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md border border-ink-700 text-ink-400 hover:border-acid hover:text-acid transition-all"
              >
                <Lock size={13} />
                <span>관리자</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => onUploadSuccess?.()}
        />
      )}
      {showLogin && (
        <AdminLoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}
