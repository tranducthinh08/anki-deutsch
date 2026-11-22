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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-base">
              Danh sách từ ({completedCount}/{cards.length} đã xong)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ tiếng Đức hoặc nghĩa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Word items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-50">
          {filteredCards.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Không tìm thấy từ nào phù hợp.
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
                    "w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-all",
                    isCurrent
                      ? "bg-indigo-50 border-2 border-indigo-500/50 shadow-sm"
                      : "hover:bg-slate-50 border border-transparent"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold truncate",
                        isCurrent ? "text-indigo-700" : "text-slate-800"
                      )}
                    >
                      {card.front}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{card.back || "Chưa có nghĩa"}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} /> Hoàn thành
                      </span>
                    ) : stepsDoneCount > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <Clock size={11} /> {stepsDoneCount}/3 bước
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Chưa luyện
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
