"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnkiCard } from "@/lib/anki";
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

interface FlashcardDeckProps {
  cards: AnkiCard[];
}

export default function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = cards[index % cards.length];

  const handleNext = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        setIsFlipped(false);
        setIndex((prev) => (prev + 1) % cards.length);
      } else if (e.key === "ArrowLeft") {
        setIsFlipped(false);
        setIndex((prev) => (prev - 1 + cards.length) % cards.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards.length]);

  if (!current) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      {/* 3D Flip Card Container */}
      <div
        className="relative h-80 w-full cursor-pointer perspective-1000 select-none"
        onClick={handleFlip}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-full duration-500 transition-transform rounded-3xl"
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT SIDE (German Word) */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#161a29] via-[#111420] to-[#0c0e17] border-2 border-amber-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                Thẻ {index + 1} / {cards.length}
              </span>
              <span className="text-slate-400 font-medium">Tiếng Đức (Mặt trước)</span>
            </div>

            <div className="text-center space-y-4 my-auto">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {current.front}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSpeak(e, current.front)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isPlaying
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                      : "bg-[#1d2238] border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/50"
                  }`}
                  title="Nghe phát âm chuẩn"
                >
                  <Volume2 size={22} />
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <RotateCw size={12} className="text-amber-400 animate-spin" />
              <span>Chạm vào thẻ hoặc bấm phím <strong>Space</strong> để lật nghĩa</span>
            </div>
          </div>

          {/* BACK SIDE (Vietnamese Meaning) */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1c1829] via-[#141220] to-[#0d0b17] border-2 border-emerald-500/35 rounded-3xl p-8 flex flex-col justify-between shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                Thẻ {index + 1} / {cards.length}
              </span>
              <span className="text-emerald-300 font-semibold">Nghĩa tiếng Việt (Mặt sau)</span>
            </div>

            <div className="text-center space-y-3 my-auto">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Từ vựng: <strong className="text-white text-base">{current.front}</strong>
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-200">
                {current.back || "(Chưa có nghĩa tiếng Việt)"}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Chạm để lật lại</span>
              <Link
                href={`/practice?word=${encodeURIComponent(current.front)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
              >
                <span>Vào phòng luyện câu</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 px-2">
        <button
          onClick={handlePrev}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141829] hover:bg-[#1a2036] border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Thẻ trước (←)</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-6 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
        >
          <RotateCw size={15} />
          <span>Lật thẻ (Space)</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141829] hover:bg-[#1a2036] border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors"
        >
          <span>Thẻ sau (→)</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
