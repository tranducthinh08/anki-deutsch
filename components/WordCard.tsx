"use client";

import { useState } from "react";
import Link from "next/link";
import { AnkiCard } from "@/lib/anki";
import { Volume2, ArrowRight, Eye, EyeOff, CheckCircle2, Zap } from "lucide-react";

interface WordCardProps {
  card: AnkiCard;
  index?: number;
  isCompleted?: boolean;
}

export default function WordCard({ card, index, isCompleted = false }: WordCardProps) {
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
    <div className="group relative bg-[#121524]/85 hover:bg-[#161a2e] backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-amber-500/18 hover:border-amber-400/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top radiant gold edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/35 to-transparent group-hover:via-amber-400 transition-all duration-500" />

      {/* Main Content */}
      <div className="space-y-4">
        {/* Header: Word & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {typeof index === "number" && (
              <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-amber-400 transition-colors">
                #{String(index + 1).padStart(2, "0")}
              </span>
            )}
            <span className="text-xl font-extrabold text-white group-hover:text-amber-200 transition-colors tracking-tight">
              {card.front}
            </span>
            <button
              onClick={(e) => handleSpeak(e, card.front)}
              className={`p-1.5 rounded-full border transition-all ${
                isPlaying
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  : "bg-[#181c2d] border-slate-700/60 text-slate-400 hover:text-amber-300 hover:border-amber-500/40"
              }`}
              title="Phát âm tiếng Đức chuẩn"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isCompleted ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={11} /> Đã luyện
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-300/80 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                {card.deckName.split("::").pop() || "A1"}
              </span>
            )}
          </div>
        </div>

        {/* Meaning Area (Tap to reveal - Clean dark styling) */}
        <div className="min-h-[46px] flex items-center">
          {showMeaning ? (
            <div className="w-full bg-[#0d101c] border border-amber-500/25 rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-200 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
              <p className="text-sm font-semibold text-amber-100">
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
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-700/70 hover:border-amber-500/50 bg-[#0d101c]/60 hover:bg-[#141829] text-xs text-slate-400 hover:text-amber-300 flex items-center justify-center gap-2 transition-all font-medium group/btn"
            >
              <Eye size={13} className="group-hover/btn:text-amber-400 transition-colors" />
              <span>Chạm để mở nghĩa tiếng Việt</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <Zap size={11} className="text-amber-400" />
          <span>Lộ trình A1</span>
        </span>

        <Link
          href={`/practice?word=${encodeURIComponent(card.front)}`}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? "bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white"
              : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          }`}
        >
          <span>{isCompleted ? "Luyện lại" : "Luyện từ này"}</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
