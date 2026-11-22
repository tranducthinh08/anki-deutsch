"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  Search,
  Sparkles,
  HelpCircle,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrambleWordItem {
  de: string;
  vi: string;
}

interface StepScrambleProps {
  exercise: {
    words: Array<string | ScrambleWordItem>;
    correctSentence: string;
    translation: string;
    explanation: string;
  };
  isStepDone?: boolean;
  onStepSuccess?: () => void;
  onComplete: () => void;
}

interface WordToken {
  id: number;
  text: string;
  meaning: string;
}

export default function StepScramble({
  exercise,
  isStepDone = false,
  onStepSuccess,
  onComplete,
}: StepScrambleProps) {
  const [availableWords, setAvailableWords] = useState<WordToken[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordToken[]>([]);
  const [isAnswered, setIsAnswered] = useState(isStepDone);
  const [isCorrect, setIsCorrect] = useState(isStepDone);

  // Interaction mode: "arrange" (default) or "translate" (tap any word to see its translation)
  const [mode, setMode] = useState<"arrange" | "translate">("arrange");

  // Track which specific words have had their translation revealed by the user
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  // Active tooltip/inspected word
  const [activeTooltip, setActiveTooltip] = useState<{
    word: WordToken;
    loading?: boolean;
  } | null>(null);

  useEffect(() => {
    const parsed: WordToken[] = exercise.words.map((item, idx) => {
      if (typeof item === "string") {
        return { id: idx, text: item, meaning: "" };
      }
      return { id: idx, text: item.de, meaning: item.vi || "" };
    });

    setAvailableWords(parsed);
    setSelectedWords([]);
    setIsAnswered(false);
    setIsCorrect(false);
    setRevealedIds(new Set());
    setActiveTooltip(null);
  }, [exercise]);

  // Handle clicking a word chip in the pool
  const handleChipClick = (wordObj: WordToken) => {
    if (isAnswered) return;

    if (mode === "translate") {
      // In translate mode: tapping anywhere on the chip reveals meaning
      inspectWord(wordObj);
      return;
    }

    // In arrange mode: tapping moves the word into the sentence
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setSelectedWords((prev) => [...prev, wordObj]);
    handleSpeak(wordObj.text);
  };

  const handleRemoveWord = (wordObj: WordToken) => {
    if (isAnswered) return;
    setSelectedWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setAvailableWords((prev) => [...prev, wordObj]);
  };

  const handleReset = () => {
    const parsed: WordToken[] = exercise.words.map((item, idx) => {
      if (typeof item === "string") {
        return { id: idx, text: item, meaning: "" };
      }
      return { id: idx, text: item.de, meaning: item.vi || "" };
    });
    setAvailableWords(parsed);
    setSelectedWords([]);
    setIsAnswered(false);
    setIsCorrect(false);
    setRevealedIds(new Set());
    setActiveTooltip(null);
  };

  // Inspect and translate a word when tapped
  const inspectWord = async (wordObj: WordToken, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleSpeak(wordObj.text);

    // Mark as revealed so its meaning can show on the chip
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.add(wordObj.id);
      return next;
    });

    if (wordObj.meaning) {
      setActiveTooltip({ word: wordObj, loading: false });
      return;
    }

    setActiveTooltip({
      word: { ...wordObj, meaning: "Đang tra nghĩa..." },
      loading: true,
    });

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: wordObj.text,
          contextSentence: exercise.correctSentence,
        }),
      });
      const data = await res.json();
      const meaning = data.meaning || "Từ vựng tiếng Đức";

      const updated = { ...wordObj, meaning };
      setAvailableWords((prev) =>
        prev.map((w) => (w.id === wordObj.id ? updated : w))
      );
      setSelectedWords((prev) =>
        prev.map((w) => (w.id === wordObj.id ? updated : w))
      );
      setActiveTooltip({ word: updated, loading: false });
    } catch {
      setActiveTooltip({
        word: { ...wordObj, meaning: "Không tra được nghĩa" },
        loading: false,
      });
    }
  };

  const handleCheck = () => {
    if (selectedWords.length === 0) return;

    const userSentence = selectedWords.map((w) => w.text).join(" ").trim();
    const normalize = (s: string) => s.replace(/[.,!?;:]/g, "").trim().toLowerCase();

    const correct = normalize(userSentence) === normalize(exercise.correctSentence);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      handleSpeak(exercise.correctSentence);
      onStepSuccess?.();
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

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h3 className="font-semibold text-slate-800 text-base">
            Bước 2: Sắp xếp từ thành câu đúng
          </h3>
        </div>

        {/* Mode Toggle Bar: Arrange vs Tap to Translate */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMode("arrange")}
            className={cn(
              "px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1",
              mode === "arrange"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <span>👆 Xếp câu</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("translate")}
            className={cn(
              "px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1",
              mode === "translate"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-indigo-600"
            )}
            title="Chạm vào bất kỳ từ nào để tra nghĩa tiếng Việt"
          >
            <Search size={12} />
            <span>Chạm để dịch</span>
          </button>
        </div>
      </div>

      {/* Target prompt */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-center space-y-1">
        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
          Sắp xếp các từ theo câu có nghĩa:
        </p>
        <p className="text-base sm:text-lg font-bold text-slate-800">
          &ldquo;{exercise.translation}&rdquo;
        </p>
      </div>

      {/* Answer Drop Area */}
      <div className="min-h-[76px] p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-wrap items-center justify-center gap-2.5 transition-all">
        {selectedWords.length === 0 ? (
          <span className="text-sm text-slate-400 italic">
            Chạm vào các từ bên dưới để ghép vào đây...
          </span>
        ) : (
          selectedWords.map((wordObj) => {
            const hasMeaning = revealedIds.has(wordObj.id) && wordObj.meaning;
            return (
              <div
                key={wordObj.id}
                onClick={() => handleRemoveWord(wordObj)}
                className="group relative cursor-pointer py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all transform active:scale-95 flex flex-col items-center"
              >
                <span className="text-base font-bold leading-tight">{wordObj.text}</span>
                {hasMeaning && (
                  <span className="text-[10px] text-indigo-200 leading-none mt-0.5 font-normal">
                    {wordObj.meaning}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Word Pool Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          {mode === "translate" ? (
            <span className="text-indigo-600 font-semibold flex items-center gap-1">
              <Sparkles size={13} /> Chế độ tra từ đang bật: Chạm vào từ bất kỳ để xem nghĩa!
            </span>
          ) : (
            <span>Chạm vào từ để xếp vào câu (hoặc bấm ❓ bên cạnh để xem nghĩa):</span>
          )}
        </div>

        {/* Clean Word Chips Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 min-h-[64px] p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
          {availableWords.map((wordObj) => {
            const isRevealed = revealedIds.has(wordObj.id) && wordObj.meaning;
            const isInspecting = activeTooltip?.word.id === wordObj.id;

            return (
              <div
                key={wordObj.id}
                className={cn(
                  "relative inline-flex items-center rounded-2xl border-2 transition-all shadow-sm overflow-hidden",
                  isInspecting
                    ? "border-indigo-500 ring-4 ring-indigo-100 bg-indigo-50/30"
                    : "border-slate-200 hover:border-indigo-300 bg-white"
                )}
              >
                {/* Main Chip Body */}
                <button
                  type="button"
                  onClick={() => handleChipClick(wordObj)}
                  disabled={isAnswered}
                  className="py-2.5 px-4 flex flex-col items-center justify-center hover:bg-indigo-50/30 transition-colors"
                >
                  <span className="text-base font-bold text-slate-800 leading-tight">
                    {wordObj.text}
                  </span>

                  {/* ONLY show meaning if the user tapped to reveal this specific word */}
                  {isRevealed && (
                    <span className="text-[11px] text-indigo-600 font-semibold leading-tight mt-0.5 animate-in fade-in">
                      {wordObj.meaning}
                    </span>
                  )}
                </button>

                {/* Question mark / info button to inspect without moving */}
                <button
                  type="button"
                  onClick={(e) => inspectWord(wordObj, e)}
                  className="px-2 py-3 border-l border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title={`Tra nghĩa từ "${wordObj.text}"`}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Meaning Popover Card (appears ONLY when user taps/inspects a word) */}
      {activeTooltip && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-indigo-950">
                {activeTooltip.word.text}
              </span>
              <button
                onClick={() => handleSpeak(activeTooltip.word.text)}
                className="p-1 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                title="Nghe phát âm"
              >
                <Volume2 size={16} />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              💬 Nghĩa:{" "}
              {activeTooltip.loading ? (
                <span className="inline-flex items-center gap-1 text-slate-400 font-normal">
                  <Loader2 size={13} className="animate-spin" /> Đang dịch...
                </span>
              ) : (
                <span className="text-indigo-700 font-bold">
                  {activeTooltip.word.meaning || "Từ vựng tiếng Đức"}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* If in available pool, provide a direct button to place it */}
            {availableWords.some((w) => w.id === activeTooltip.word.id) && (
              <button
                onClick={() => {
                  handleChipClick(activeTooltip.word);
                  setActiveTooltip(null);
                }}
                className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              >
                <Check size={13} />
                <span>Xếp vào câu</span>
              </button>
            )}

            <button
              onClick={() => setActiveTooltip(null)}
              className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-white border border-indigo-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Action buttons (Check / Reset) */}
      {!isAnswered && (
        <div className="flex items-center justify-end gap-2 pt-2">
          {selectedWords.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <RotateCcw size={14} /> Xóa làm lại
            </button>
          )}
          <button
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <span>Kiểm tra câu</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Feedback box */}
      {isAnswered && (
        <div
          className={cn(
            "p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm",
            isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"
          )}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Chính xác hoàn hảo! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-red-500" />
                  <span>
                    Chưa đúng trật tự câu rồi! Đáp án chuẩn: &ldquo;{exercise.correctSentence}&rdquo;
                  </span>
                </>
              )}
            </div>

            {isCorrect && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-800">{exercise.correctSentence}</span>
                <button
                  onClick={() => handleSpeak(exercise.correctSentence)}
                  className="text-emerald-600 hover:text-emerald-800 p-0.5"
                  title="Nghe"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            )}

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
              <span>Bước 3: Viết câu</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
