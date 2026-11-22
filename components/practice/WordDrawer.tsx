"use client";

import { useState } from "react";
import { AnkiCard } from "@/lib/anki";
import { DayProgress, normalizeWordKey } from "@/lib/progress";
import { X, CheckCircle2, Search, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cards: AnkiCard[];
  currentIndex: number;
  dayProgress: DayProgress;
  onSelectWord: (index: number) => void;
}

export default function WordDrawer({
  isOpen,
  onClose,
  cards,
  currentIndex,
  dayProgress,
  onSelectWord,
}: WordDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const completedCount = cards.filter(
    (c) => dayProgress[normalizeWordKey(c.front)]?.completed
  ).length;

  const filteredCards = cards.filter(
    (c) =>
      c.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0e111d]/95 backdrop-blur-2xl border-l border-amber-500/20 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">
                Danh sách từ vựng hôm nay
              </h2>
              <p className="text-[11px] text-amber-400 font-semibold">
                {completedCount} / {cards.length} từ đã hoàn thành
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800/80 bg-[#0a0c16]/80">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ tiếng Đức hoặc nghĩa tiếng Việt..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#070912] text-white placeholder:text-slate-500 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Word items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Không tìm thấy từ vựng nào phù hợp.
            </div>
          ) : (
            filteredCards.map((card) => {
              const actualIndex = cards.findIndex((c) => c.cardId === card.cardId);
              const isCurrent = actualIndex === currentIndex;
              const progress = dayProgress[normalizeWordKey(card.front)];
              const isDone = progress?.completed;
              const stepsDoneCount =
                (progress?.step1 ? 1 : 0) +
                (progress?.step2 ? 1 : 0) +
                (progress?.step3 ? 1 : 0);

              return (
                <button
                  key={card.cardId}
                  onClick={() => {
                    onSelectWord(actualIndex);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all",
                    isCurrent
                      ? "bg-amber-500/15 border-2 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "bg-[#121524]/60 hover:bg-[#161a2e] border border-slate-800/70"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold truncate",
                        isCurrent ? "text-amber-300" : "text-slate-200"
                      )}
                    >
                      {card.front}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {card.back || "Chưa có nghĩa"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 size={11} /> Xong
                      </span>
                    ) : stepsDoneCount > 0 ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Clock size={10} /> {stepsDoneCount}/3
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        Chưa
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
