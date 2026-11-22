"use client";

import { useState } from "react";
import Link from "next/link";
import { AnkiCard } from "@/lib/anki";
import { Volume2, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface WordCardProps {
  card: AnkiCard;
  isCompleted?: boolean;
}

export default function WordCard({ card, isCompleted = false }: WordCardProps) {
  const [showMeaning, setShowMeaning] = useState(false);

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Card Header & Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              {card.front}
            </span>
            <button
              onClick={() => handleSpeak(card.front)}
              className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Nghe phát âm"
            >
              <Volume2 size={17} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isCompleted && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={11} /> Đã luyện
              </span>
            )}
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {card.deckName.split("::").pop()}
            </span>
          </div>
        </div>

        {/* Vietnamese Meaning Section */}
        <div className="min-h-[44px] flex items-center">
          {showMeaning ? (
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 animate-in fade-in">
              <p className="text-sm font-medium text-slate-700">
                {card.back || "(Chưa có nghĩa tiếng Việt)"}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowMeaning(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-1.5 transition-all font-medium"
            >
              <Eye size={13} />
              <span>Chạm để xem nghĩa</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
        {showMeaning ? (
          <button
            onClick={() => setShowMeaning(false)}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <EyeOff size={12} /> Ẩn nghĩa
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">Chuẩn A1</span>
        )}

        <Link
          href={`/practice?word=${encodeURIComponent(card.front)}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:translate-x-0.5 transition-all"
        >
          <span>{isCompleted ? "Luyện lại" : "Luyện từ này"}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
