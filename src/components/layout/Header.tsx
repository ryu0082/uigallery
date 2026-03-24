"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Bell, Lock, LogOut } from "lucide-react";
import { UploadModal } from "@/components/gallery/UploadModal";
import { AdminLoginModal } from "@/components/gallery/AdminLoginModal";
import { useAdminStore } from "@/lib/adminStore";

export function Header({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { isAdmin, logout } = useAdminStore();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#c8ff00] flex items-center justify-center">
              <span className="text-[#0a0a0a] font-bold text-xs">UI</span>
            </div>
            <span className="font-bold text-lg text-[#f0f0f0] tracking-tight">UIVault</span>
          </Link>

          {/* 네비 */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "탐색", href: "#" },
              { label: "컬렉션", href: "#" },
              { label: "인기", href: "#" },
              { label: "최신", href: "#" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-sm text-[#999999] hover:text-[#f0f0f0] transition-colors rounded-md hover:bg-[#1c1c1c]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측 버튼 */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="hidden md:flex items-center px-3 py-1.5 text-[#999999] hover:text-[#f0f0f0] hover:bg-[#1c1c1c] rounded-md transition-all">
              <Bell size={14} />
            </button>

            {isAdmin ? (
              <>
                <span className="text-xs font-mono text-[#c8ff00] border border-[#c8ff00]/30 px-2 py-1 rounded-md">관리자</span>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md bg-[#c8ff00] text-[#0a0a0a] hover:bg-[#c8ff00]/90 transition-all"
                >
                  <Upload size={13} />
                  <span>앱 등록</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-1.5 text-[#999999] hover:text-[#ff4d3d] hover:bg-[#1c1c1c] rounded-md transition-all"
                  title="로그아웃"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md border border-[#3d3d3d] text-[#999999] hover:border-[#c8ff00] hover:text-[#c8ff00] transition-all"
              >
                <Lock size={13} />
                <span>관리자</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => onUploadSuccess?.()} />
      )}
      {showLogin && (
        <AdminLoginModal onClose={() => setShowLogin(false)} onSuccess={() => {}} />
      )}
    </>
  );
}
