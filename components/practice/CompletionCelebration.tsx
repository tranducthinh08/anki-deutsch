"use client";

import Link from "next/link";
import { Trophy, RotateCcw, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

interface CompletionCelebrationProps {
  totalWords: number;
  onRestart: () => void;
}

export default function CompletionCelebration({
  totalWords,
  onRestart,
}: CompletionCelebrationProps) {
  return (
    <div className="max-w-md mx-auto text-center py-12 px-4 space-y-6 animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-amber-200">
        <Trophy size={40} className="text-white" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles size={13} /> Hoàn thành 100% mục tiêu hôm nay
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Tuyệt vời! Bạn đã làm rất tốt 🎉
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Bạn vừa trải qua 3 bước luyện tập sâu cho toàn bộ <strong>{totalWords} từ vựng</strong> tiếng Đức đã học hôm nay.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
          <span className="text-slate-500">Số từ đã hoàn thành:</span>
          <span className="font-bold text-indigo-600">{totalWords} từ</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
          <span className="text-slate-500">Trình độ thực hành:</span>
          <span className="font-bold text-emerald-600">A1 Cơ bản vững chắc</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-slate-500">Trạng thái:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-xs">
            <CheckCircle2 size={14} /> Sẵn sàng áp dụng đời sống
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={onRestart}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
        >
          <RotateCcw size={16} /> Luyện lại từ đầu
        </button>

        <Link
          href="/"
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md"
        >
          <ArrowLeft size={16} /> Về Dashboard
        </Link>
      </div>
    </div>
  );
}
