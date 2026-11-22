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

  // Inspected option for quick translation popover (ONLY shows when tapped)
  const [inspectingWord, setInspectingWord] = useState<{ de: string; vi: string } | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  // Normalize options into { de, vi }
  const parsedOptions: OptionItem[] = exercise.options.map((opt) => {
    if (typeof opt === "string") {
      return { de: opt, vi: "" };
    }
    return { de: opt.de, vi: opt.vi || "" };
  });

  const isCorrect =
    selectedOption?.trim().toLowerCase() === exercise.correctWord.trim().toLowerCase();

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

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      window.speechSynthesis.speak(utter);
    }
  };

  const fullSentence = isCorrect
    ? exercise.sentenceWithBlank.replace("___", exercise.correctWord)
    : exercise.sentenceWithBlank;

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="font-semibold text-slate-800 text-base">
            Bước 1: Điền từ vào chỗ trống
          </h3>
        </div>
        <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
          Nhận diện từ vựng
        </span>
      </div>

      {/* Exercise Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xl sm:text-2xl font-bold text-slate-800 tracking-wide">
            {isCorrect ? (
              <span className="text-emerald-700">{fullSentence}</span>
            ) : (
              exercise.sentenceWithBlank.split("___").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block px-3 py-0.5 mx-1.5 border-b-2 border-dashed border-indigo-400 bg-indigo-50/50 text-indigo-700 rounded font-semibold">
                      {selectedOption ? selectedOption : "______"}
                    </span>
                  )}
                </span>
              ))
            )}
          </p>
          {isCorrect && (
            <button
              onClick={() => handleSpeak(fullSentence)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
              title="Nghe phát âm"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>

        <p className="text-sm text-slate-500 font-medium">
          💬 Nghĩa: &ldquo;{exercise.translation}&rdquo;
        </p>
      </div>

      {/* Options grid (Clean German text, no permanent meaning) */}
      <div className="grid grid-cols-2 gap-3">
        {parsedOptions.map((opt, idx) => {
          const isThisSelected = selectedOption === opt.de;
          const isThisCorrect =
            opt.de.trim().toLowerCase() === exercise.correctWord.trim().toLowerCase();

          let btnStyle =
            "bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-indigo-50/30";
          if (isAnswered) {
            if (isThisCorrect) {
              btnStyle =
                "bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold ring-2 ring-emerald-200";
            } else if (isThisSelected) {
              btnStyle = "bg-red-50 border-red-300 text-red-700 font-semibold";
            } else {
              btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <div
              key={idx}
              className="relative flex items-stretch rounded-2xl border-2 transition-all shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleSelect(opt.de)}
                disabled={isAnswered}
                className={cn(
                  "flex-1 py-3.5 px-4 text-center font-bold text-base transition-all active:scale-95",
                  btnStyle
                )}
              >
                <span>{opt.de}</span>
              </button>

              {/* Translate button (❓) */}
              <button
                type="button"
                onClick={(e) => handleInspect(e, opt)}
                className="px-2.5 bg-slate-50/80 border-l border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                title={`Tra nghĩa "${opt.de}"`}
              >
                <HelpCircle size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Word Glossary Card (ONLY appears when user taps ❓) */}
      {inspectingWord && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-blue-950">
                {inspectingWord.de}
              </span>
              <button
                onClick={() => handleSpeak(inspectingWord.de)}
                className="text-blue-600 hover:text-blue-800 p-0.5"
                title="Nghe phát âm"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              💬 Nghĩa:{" "}
              {loadingTranslation ? (
                <span className="inline-flex items-center gap-1 text-slate-400 font-normal">
                  <Loader2 size={12} className="animate-spin" /> Đang dịch...
                </span>
              ) : (
                <span className="text-blue-700 font-bold">{inspectingWord.vi || "Từ vựng tiếng Đức"}</span>
              )}
            </p>
          </div>

          <button
            onClick={() => setInspectingWord(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/50 transition-colors"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Feedback box */}
      {isAnswered && (
        <div
          className={cn(
            "p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm",
            isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Chính xác! Giỏi lắm 🎉</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-500" />
                  <span>Chưa đúng rồi! Đáp án là &quot;{exercise.correctWord}&quot;</span>
                </>
              )}
            </div>
            {exercise.explanation && (
              <p className="text-xs text-slate-600 flex items-start gap-1">
                <Lightbulb size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{exercise.explanation}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isCorrect ? (
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-red-200 hover:bg-red-100/50 text-red-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw size={14} /> Thử lại
              </button>
            ) : null}

            <button
              onClick={onComplete}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Bước 2: Xếp câu</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
