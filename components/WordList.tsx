"use client";

import { useState, useEffect, useMemo } from "react";
import { AnkiCard } from "@/lib/anki";
import { loadTodayProgress, normalizeWordKey, DayProgress } from "@/lib/progress";
import WordCard from "./WordCard";
import { BookOpen, Search, X, Filter, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface WordListProps {
  cards: AnkiCard[];
}

type FilterTab = "all" | "pending" | "completed";

export default function WordList({ cards }: WordListProps) {
  const [query, setQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [alphabeticalSort, setAlphabeticalSort] = useState(false);
  const [dayProgress, setDayProgress] = useState<DayProgress>({});

  useEffect(() => {
    setDayProgress(loadTodayProgress());
  }, []);

  const completedCount = useMemo(() => {
    return cards.filter((c) => dayProgress[normalizeWordKey(c.front)]?.completed).length;
  }, [cards, dayProgress]);

  const pendingCount = cards.length - completedCount;

  // Filter & Search logic
  const filteredCards = useMemo(() => {
    let result = cards.filter((c) => {
      const matchQuery =
        c.front.toLowerCase().includes(query.toLowerCase()) ||
        c.back.toLowerCase().includes(query.toLowerCase());

      if (!matchQuery) return false;

      const isDone = dayProgress[normalizeWordKey(c.front)]?.completed;
      if (filterTab === "completed") return isDone;
      if (filterTab === "pending") return !isDone;
      return true;
    });

    if (alphabeticalSort) {
      result = [...result].sort((a, b) => a.front.localeCompare(b.front));
    }

    return result;
  }, [cards, query, filterTab, alphabeticalSort, dayProgress]);

  if (cards.length === 0) {
    return (
      <div className="bg-[#0c1427]/60 border border-sky-500/15 rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
          <BookOpen size={30} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Chưa có từ nào được review hôm nay</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hãy mở Anki Desktop, học một vài thẻ từ vựng tiếng Đức, sau đó quay lại đây và nhấn &quot;Làm mới&quot; nhé!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control HUD: Search & Filters */}
      <div className="bg-[#0c1427]/90 backdrop-blur-xl border border-sky-500/15 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Tìm kiếm trong ${cards.length} từ hôm nay...`}
            className="w-full pl-10 pr-9 py-2.5 bg-[#070d19] text-white placeholder:text-slate-500 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 flex-shrink-0">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Filter size={12} />
            <span>Tất cả ({cards.length})</span>
          </button>

          <button
            onClick={() => setFilterTab("pending")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "pending"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Clock size={12} />
            <span>Cần luyện ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterTab("completed")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "completed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Đã xong ({completedCount})</span>
          </button>

          <button
            onClick={() => setAlphabeticalSort(!alphabeticalSort)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              alphabeticalSort
                ? "bg-sky-500/20 text-sky-300 border-sky-400/50"
                : "bg-slate-900/40 text-slate-500 hover:text-slate-300 border-slate-800"
            }`}
            title="Sắp xếp theo bảng chữ cái A-Z"
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="bg-[#0c1427]/60 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400 text-sm space-y-2">
          <p className="font-semibold text-slate-300">Không tìm thấy từ vựng nào</p>
          <p className="text-xs text-slate-500">
            {query
              ? `Không có kết quả khớp với "${query}".`
              : "Không có từ vựng nào trong bộ lọc này."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const isCompleted =
              dayProgress[normalizeWordKey(card.front)]?.completed ?? false;
            return (
              <WordCard
                key={card.cardId}
                card={card}
                isCompleted={isCompleted}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
