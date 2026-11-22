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
      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] border border-amber-300/60">
        <Trophy size={48} className="text-slate-950" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/30 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold">
          <Sparkles size={13} className="text-amber-400" />
          <span>Hoàn thành 100% mục tiêu hôm nay</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Tuyệt Vời! Bạn Đã Về Đích 🎉
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          Bạn vừa làm chủ toàn bộ <strong>{totalWords} từ vựng</strong> tiếng Đức qua 3 bước: Điền từ ngữ cảnh, Xếp câu trật tự V2, và Tự sáng tác câu cùng AI.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-[#121524]/85 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-3 text-left">
        <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
          <span className="text-slate-400">Tổng từ vựng Anki đã luyện:</span>
          <span className="font-extrabold text-amber-300 text-sm">{totalWords} từ</span>
        </div>
        <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
          <span className="text-slate-400">Trình độ thực hành:</span>
          <span className="font-extrabold text-emerald-400 text-sm">A1 Vững Chắc</span>
        </div>
        <div className="flex items-center justify-between text-xs py-1.5">
          <span className="text-slate-400">Trạng thái:</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-xs">
            <CheckCircle2 size={13} /> Sẵn sàng giao tiếp thực tế
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={onRestart}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-slate-700 hover:border-slate-500 bg-[#141829] text-slate-300 hover:text-white font-bold text-xs transition-colors"
        >
          <RotateCcw size={15} /> Luyện lại từ đầu
        </button>

        <Link
          href="/"
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 font-black text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)]"
        >
          <ArrowLeft size={15} /> Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
