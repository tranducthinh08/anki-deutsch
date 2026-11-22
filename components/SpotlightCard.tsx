"use client";

import { useState } from "react";
import Link from "next/link";
import { AnkiCard } from "@/lib/anki";
import { Volume2, ArrowRight, Eye, EyeOff, Shuffle, Sparkles } from "lucide-react";

interface SpotlightCardProps {
  cards: AnkiCard[];
}

export default function SpotlightCard({ cards }: SpotlightCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex % cards.length];

  const handleShuffle = () => {
    setShowMeaning(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      utter.rate = 0.9;
      utter.onstart = () => setIsPlaying(true);
      utter.onend = () => setIsPlaying(false);
      utter.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utter);
    }
  };

  // Detect word type for badge
  const word = currentCard.front.trim();
  let articleType: "der" | "die" | "das" | "verb" | "other" = "other";
  if (/^der\s+/i.test(word)) articleType = "der";
  else if (/^die\s+/i.test(word)) articleType = "die";
  else if (/^das\s+/i.test(word)) articleType = "das";
  else if (/^[a-zäöü].*(en|eln|ern)$/.test(word)) articleType = "verb";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#151928] via-[#10131e] to-[#0d0f17] border border-amber-500/25 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between space-y-4">
      {/* Background ambient gold ray */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={13} className="text-amber-400" />
            Từ Tiêu Điểm
          </span>
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-[#1a1e30] border border-slate-800 hover:border-amber-500/40 transition-colors"
          title="Xem từ ngẫu nhiên khác hôm nay"
        >
          <Shuffle size={12} />
          <span>Đổi từ ({currentIndex + 1}/{cards.length})</span>
        </button>
      </div>

      {/* Main Word Display */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentCard.front}
          </span>

          <button
            onClick={() => handleSpeak(currentCard.front)}
            className={`p-2 rounded-xl border transition-all ${
              isPlaying
                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-[#181d2e] border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/40"
            }`}
            title="Nghe phát âm chuẩn"
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
                <span className="w-1 bg-amber-400 rounded-full animate-wave-1" />
                <span className="w-1 bg-amber-400 rounded-full animate-wave-2" />
                <span className="w-1 bg-amber-400 rounded-full animate-wave-3" />
              </div>
            ) : (
              <Volume2 size={16} />
            )}
          </button>
        </div>

        {/* Word Tag / Category */}
        <div className="flex items-center gap-2">
          {articleType === "der" && (
            <span className="text-[10px] font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-500/30">
              Giống đực (maskulin)
            </span>
          )}
          {articleType === "die" && (
            <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Giống cái (feminin)
            </span>
          )}
          {articleType === "das" && (
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Giống trung (neutral)
            </span>
          )}
          {articleType === "verb" && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Động từ (Verb)
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
            {currentCard.deckName.split("::").pop()}
          </span>
        </div>

        {/* Meaning reveal */}
        <div className="min-h-[44px] flex items-center">
          {showMeaning ? (
            <div className="w-full bg-[#161a29] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <p className="text-sm font-bold text-amber-200">
                {currentCard.back || "(Chưa có nghĩa tiếng Việt)"}
              </p>
              <button
                onClick={() => setShowMeaning(false)}
                className="text-slate-500 hover:text-slate-300 p-0.5"
                title="Ẩn nghĩa"
              >
                <EyeOff size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMeaning(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700/80 hover:border-amber-500/50 bg-[#121624] text-xs text-slate-400 hover:text-amber-300 flex items-center justify-center gap-2 transition-all font-medium"
            >
              <Eye size={13} />
              <span>Chạm để xem nghĩa</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
        <Link
          href={`/practice?word=${encodeURIComponent(currentCard.front)}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <span>Luyện từ này ngay</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
