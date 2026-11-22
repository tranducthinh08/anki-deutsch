"use client";

import { useState, useEffect } from "react";
import { AnkiCard } from "@/lib/anki";
import { loadTodayProgress, normalizeWordKey, DayProgress } from "@/lib/progress";
import WordCard from "./WordCard";
import { BookOpen, Search, X } from "lucide-react";

interface WordListProps {
  cards: AnkiCard[];
}

export default function WordList({ cards }: WordListProps) {
  const [query, setQuery] = useState("");
  const [dayProgress, setDayProgress] = useState<DayProgress>({});

  useEffect(() => {
    setDayProgress(loadTodayProgress());
  }, []);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <BookOpen size={48} className="mb-4 opacity-40" />
        <p className="text-lg font-medium">Hôm nay chưa ôn tập từ nào</p>
        <p className="text-sm mt-1">Mở Anki và ôn tập một số thẻ trước nhé!</p>
      </div>
    );
  }

  const filteredCards = cards.filter(
    (c) =>
      c.front.toLowerCase().includes(query.toLowerCase()) ||
      c.back.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Tìm kiếm trong ${cards.length} từ hôm nay...`}
          className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 text-slate-400 text-sm">
          Không tìm thấy từ nào khớp với &quot;{query}&quot;.
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
