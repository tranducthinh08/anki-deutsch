"use client";

import Link from "next/link";
import { ArrowLeft, ListFilter, CheckCircle } from "lucide-react";

interface PracticeHeaderProps {
  currentIndex: number;
  totalCards: number;
  completedCount: number;
  onOpenDrawer: () => void;
}

export default function PracticeHeader({
  currentIndex,
  totalCards,
  completedCount,
  onOpenDrawer,
}: PracticeHeaderProps) {
  const percent = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-[#080d19]/90 backdrop-blur-xl border-b border-sky-500/15 shadow-xl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Back button */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-cyan-300 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-slate-800/50"
        >
          <ArrowLeft size={16} />
          <span>Tổng quan</span>
        </Link>

        {/* Progress center */}
        <div className="flex-1 max-w-xs text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>
              Từ <strong className="text-cyan-400 font-bold">{currentIndex + 1}</strong> / {totalCards}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle size={12} /> {completedCount} xong
            </span>
          </div>
          <div className="w-full bg-[#070d1a] border border-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Word list drawer button */}
        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl border border-sky-500/25 bg-[#0c1427]/80 hover:bg-[#101b33] text-cyan-300 hover:border-cyan-400/50 transition-all shadow-sm"
        >
          <ListFilter size={15} />
          <span className="hidden sm:inline">Danh sách từ</span>
        </button>
      </div>
    </header>
  );
}
