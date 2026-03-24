"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/adminStore";
import { Lock, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ onClose, onSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAdminStore();

  const handleSubmit = () => {
    const ok = login(password);
    if (ok) {
      onSuccess();
      onClose();
    } else {
      setError("비밀번호가 틀렸어요.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-acid" />
            <h2 className="font-display text-lg text-ink-100">관리자 로그인</h2>
          </div>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="비밀번호 입력"
              autoFocus
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-acid/50 transition-colors"
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-acid text-ink-950 font-medium text-sm rounded-lg hover:bg-acid/90 transition-all"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
