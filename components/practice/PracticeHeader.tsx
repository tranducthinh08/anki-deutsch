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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Back button */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Trang chủ</span>
        </Link>

        {/* Progress center */}
        <div className="flex-1 max-w-xs text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>
              Từ <strong className="text-indigo-600">{currentIndex + 1}</strong> / {totalCards}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle size={12} /> {completedCount} xong
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Word list drawer button */}
        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
        >
          <ListFilter size={15} />
          <span>Danh sách từ</span>
        </button>
      </div>
    </header>
  );
}
