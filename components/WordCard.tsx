"use client";

import { useState } from "react";
import Link from "next/link";
import { AnkiCard } from "@/lib/anki";
import { Volume2, ArrowRight, Eye, EyeOff, CheckCircle2, Zap } from "lucide-react";

interface WordCardProps {
  card: AnkiCard;
  isCompleted?: boolean;
}

export default function WordCard({ card, isCompleted = false }: WordCardProps) {
  const [showMeaning, setShowMeaning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
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

  return (
    <div className="group relative bg-[#0c1427]/80 hover:bg-[#0f1a33]/90 backdrop-blur-md rounded-2xl p-5 border border-sky-500/15 hover:border-cyan-400/50 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top ambient highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent group-hover:via-cyan-400 transition-all duration-500" />

      {/* Main Content */}
      <div className="space-y-4">
        {/* Header: Word & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl font-extrabold text-white group-hover:text-cyan-200 transition-colors tracking-tight">
              {card.front}
            </span>
            <button
              onClick={(e) => handleSpeak(e, card.front)}
              className={`p-1.5 rounded-full border transition-all ${
                isPlaying
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/30"
              }`}
              title="Phát âm tiếng Đức chuẩn"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isCompleted ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={11} /> Đã luyện
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-cyan-300/80 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
                {card.deckName.split("::").pop() || "A1"}
              </span>
            )}
          </div>
        </div>

        {/* Meaning Area (Tap to reveal - Clean dark styling) */}
        <div className="min-h-[46px] flex items-center">
          {showMeaning ? (
            <div className="w-full bg-[#070d1a] border border-cyan-500/30 rounded-xl p-3 animate-in fade-in zoom-in-95 duration-200 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <p className="text-sm font-semibold text-cyan-100">
                {card.back || "(Chưa có nghĩa tiếng Việt)"}
              </p>
              <button
                onClick={() => setShowMeaning(false)}
                className="text-slate-500 hover:text-slate-300 p-1 flex-shrink-0"
                title="Ẩn nghĩa"
              >
                <EyeOff size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMeaning(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700/70 hover:border-cyan-500/50 bg-[#080d19]/40 hover:bg-[#0a1324] text-xs text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all font-medium group/btn"
            >
              <Eye size={13} className="group-hover/btn:text-cyan-400 transition-colors" />
              <span>Chạm để mở nghĩa tiếng Việt</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/70 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Zap size={11} className="text-cyan-400" />
          <span>3 Bước Workout</span>
        </span>

        <Link
          href={`/practice?word=${encodeURIComponent(card.front)}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isCompleted
              ? "bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white"
              : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          }`}
        >
          <span>{isCompleted ? "Luyện lại" : "Luyện từ này"}</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
