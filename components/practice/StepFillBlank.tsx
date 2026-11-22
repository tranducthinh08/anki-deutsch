"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  HelpCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionItem {
  de: string;
  vi: string;
}

interface StepFillBlankProps {
  exercise: {
    sentenceWithBlank: string;
    correctWord: string;
    options: Array<string | OptionItem>;
    translation: string;
    explanation: string;
  };
  isStepDone?: boolean;
  onStepSuccess?: () => void;
  onComplete: () => void;
}

export default function StepFillBlank({
  exercise,
  isStepDone = false,
  onStepSuccess,
  onComplete,
}: StepFillBlankProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    isStepDone ? exercise.correctWord : null
  );
  const [isAnswered, setIsAnswered] = useState(isStepDone);
  const [showSentenceTranslation, setShowSentenceTranslation] = useState(false);

  // Inspected option for quick translation popover (ONLY shows when tapped)
  const [inspectingWord, setInspectingWord] = useState<{ de: string; vi: string } | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const parsedOptions: OptionItem[] = exercise.options.map((opt) => {
    if (typeof opt === "string") {
      return { de: opt, vi: "" };
    }
    return { de: opt.de, vi: opt.vi || "" };
  });

  const isCorrect =
    selectedOption?.trim().toLowerCase() === exercise.correctWord.trim().toLowerCase();

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleSelect = (optionText: string) => {
    if (isAnswered) return;
    setSelectedOption(optionText);
    setIsAnswered(true);

    if (optionText.trim().toLowerCase() === exercise.correctWord.trim().toLowerCase()) {
      handleSpeak(exercise.sentenceWithBlank.replace("___", exercise.correctWord));
      onStepSuccess?.();
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setInspectingWord(null);
  };

  const handleInspect = async (e: React.MouseEvent, opt: OptionItem) => {
    e.stopPropagation();
    handleSpeak(opt.de);

    if (opt.vi) {
      setInspectingWord(opt);
      return;
    }

    setInspectingWord({ de: opt.de, vi: "Đang tra nghĩa..." });
    setLoadingTranslation(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: opt.de,
          contextSentence: exercise.sentenceWithBlank,
        }),
      });
      const data = await res.json();
      setInspectingWord({ de: opt.de, vi: data.meaning || "Từ vựng tiếng Đức" });
    } catch {
      setInspectingWord({ de: opt.de, vi: "Không tra được nghĩa" });
    } finally {
      setLoadingTranslation(false);
    }
  };

  // Render sentence with stylish blank slot
  const parts = exercise.sentenceWithBlank.split("___");

  return (
    <div className="space-y-6">
      {/* Exercise Subtitle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold">
            1
          </span>
          <h3 className="text-sm font-bold text-slate-200">
            Điền từ thích hợp vào chỗ trống
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
          Nhận diện ngữ cảnh
        </span>
      </div>

      {/* German Sentence Box */}
      <div className="bg-[#080d19] border border-cyan-500/25 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
        <p className="text-xl sm:text-2xl font-extrabold text-white leading-relaxed tracking-tight">
          {parts[0]}
          <span className="inline-block mx-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border-2 border-dashed border-cyan-400 text-cyan-300 font-black min-w-[100px] text-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            {selectedOption || "_______"}
          </span>
          {parts[1]}
        </p>

        {/* Translation Toggle */}
        <div className="pt-2">
          {showSentenceTranslation ? (
            <div className="inline-flex items-center gap-2 bg-[#0c162e] border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-300 animate-in fade-in">
              <span>Nghĩa: &quot;{exercise.translation}&quot;</span>
              <button
                onClick={() => setShowSentenceTranslation(false)}
                className="text-slate-500 hover:text-slate-300 ml-1"
                title="Ẩn câu dịch"
              >
                <EyeOff size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSentenceTranslation(true)}
              className="text-xs text-slate-500 hover:text-cyan-400 inline-flex items-center gap-1.5 font-medium transition-colors"
            >
              <Eye size={13} />
              <span>Xem câu dịch tiếng Việt</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {parsedOptions.map((opt, idx) => {
          const isThisSelected = selectedOption === opt.de;
          const isThisCorrect =
            opt.de.trim().toLowerCase() === exercise.correctWord.trim().toLowerCase();

          let btnStyle = "bg-[#0c1427]/90 border-slate-800 hover:border-cyan-400/50 hover:bg-[#101c36] text-slate-100";

          if (isAnswered) {
            if (isThisCorrect) {
              btnStyle = "bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            } else if (isThisSelected && !isThisCorrect) {
              btnStyle = "bg-rose-950/80 border-rose-400 text-rose-200";
            } else {
              btnStyle = "bg-[#080d19]/60 border-slate-800 text-slate-500 opacity-50";
            }
          }

          return (
            <div key={idx} className="relative group">
              <button
                type="button"
                onClick={() => handleSelect(opt.de)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-4 rounded-xl border font-bold text-base transition-all duration-200 flex items-center justify-between text-left",
                  btnStyle
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span>{opt.de}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Tap-to-translate button */}
                  <button
                    type="button"
                    onClick={(e) => handleInspect(e, opt)}
                    className="p-1 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
                    title={`Chạm để dịch nghĩa từ "${opt.de}"`}
                  >
                    <HelpCircle size={15} />
                  </button>

                  {isAnswered && isThisCorrect && (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  )}
                  {isAnswered && isThisSelected && !isThisCorrect && (
                    <XCircle size={18} className="text-rose-400" />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Popover: Inspect Word Translation */}
      {inspectingWord && (
        <div className="bg-[#0c162e] border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300 text-sm">{inspectingWord.de}:</span>
            <span className="text-slate-300">{inspectingWord.vi}</span>
            {loadingTranslation && <Loader2 size={12} className="animate-spin text-cyan-400" />}
          </div>
          <button
            onClick={() => setInspectingWord(null)}
            className="text-slate-500 hover:text-white text-xs px-1"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Feedback & Explanation Card */}
      {isAnswered && (
        <div
          className={cn(
            "p-5 rounded-2xl border space-y-3 animate-in fade-in zoom-in-95 duration-200",
            isCorrect
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/30 border-rose-500/30 text-rose-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="font-bold text-sm text-emerald-300">Chính xác! Rất xuất sắc 🎉</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-400" />
                  <span className="font-bold text-sm text-rose-300">Chưa đúng rồi! Hãy xem gợi ý bên dưới</span>
                </>
              )}
            </div>

            <button
              onClick={() => handleSpeak(exercise.sentenceWithBlank.replace("___", exercise.correctWord))}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Nghe lại câu hoàn chỉnh"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="text-xs space-y-1.5 text-slate-300 bg-[#070d19]/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Giải thích ngữ pháp:</p>
                <p className="text-slate-400 mt-0.5">{exercise.explanation}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            {!isCorrect && (
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={13} /> Thử lại
              </button>
            )}

            <button
              onClick={onComplete}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <span>Tiếp tục Bước 2 (Xếp câu)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
