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

  // Interaction mode: "arrange" (default) or "translate"
  const [mode, setMode] = useState<"arrange" | "translate">("arrange");

  // Track which specific words have had their translation revealed
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

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleSelectWord = (token: WordToken) => {
    if (isAnswered) return;

    if (mode === "translate") {
      inspectWord(token);
      return;
    }

    setAvailableWords((prev) => prev.filter((w) => w.id !== token.id));
    setSelectedWords((prev) => [...prev, token]);
    handleSpeak(token.text);
  };

  const handleDeselectWord = (token: WordToken) => {
    if (isAnswered) return;

    if (mode === "translate") {
      inspectWord(token);
      return;
    }

    setSelectedWords((prev) => prev.filter((w) => w.id !== token.id));
    setAvailableWords((prev) => [...prev, token]);
  };

  const inspectWord = async (token: WordToken) => {
    handleSpeak(token.text);
    setRevealedIds((prev) => new Set(prev).add(token.id));

    if (token.meaning) {
      setActiveTooltip({ word: token });
      return;
    }

    setActiveTooltip({
      word: { ...token, meaning: "Đang tra nghĩa..." },
      loading: true,
    });

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: token.text,
          contextSentence: exercise.correctSentence,
        }),
      });
      const data = await res.json();
      const fetchedMeaning = data.meaning || "Từ vựng tiếng Đức";

      token.meaning = fetchedMeaning;
      setActiveTooltip({ word: { ...token, meaning: fetchedMeaning } });
    } catch {
      setActiveTooltip({
        word: { ...token, meaning: "Không tra được nghĩa" },
      });
    }
  };

  const cleanString = (s: string) =>
    s
      .replace(/[.,!?;:]/g, "")
      .trim()
      .toLowerCase();

  const handleCheck = () => {
    const userSentence = selectedWords.map((w) => w.text).join(" ");
    const correct = cleanString(userSentence) === cleanString(exercise.correctSentence);

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      handleSpeak(exercise.correctSentence);
      onStepSuccess?.();
    }
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
    setActiveTooltip(null);
  };

  return (
    <div className="space-y-6">
      {/* Exercise Subtitle & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-sky-950/70 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
            2
          </span>
          <h3 className="text-sm font-bold text-slate-200">
            Sắp xếp các từ thành câu hoàn chỉnh
          </h3>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode(mode === "arrange" ? "translate" : "arrange")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border",
              mode === "translate"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "bg-slate-900/60 text-slate-400 hover:text-cyan-300 border-slate-800"
            )}
            title="Bấm vào để chuyển chế độ: Xếp câu hoặc Tra nghĩa từng từ"
          >
            {mode === "translate" ? (
              <>
                <Search size={13} className="text-cyan-400" />
                <span>Đang bật: Chạm để dịch</span>
              </>
            ) : (
              <>
                <HelpCircle size={13} />
                <span>Chạm để dịch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Sentence Meaning Hint */}
      <div className="bg-[#080d19] border border-sky-500/20 rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-400 mb-1">Dịch nghĩa câu cần tạo:</p>
        <p className="text-base font-extrabold text-cyan-200">
          &quot;{exercise.translation}&quot;
        </p>
      </div>

      {/* Selected Words Dropzone (Magnetic Dock) */}
      <div
        className={cn(
          "min-h-[110px] p-5 rounded-2xl border-2 border-dashed transition-all flex flex-wrap items-center justify-center gap-2.5",
          selectedWords.length === 0
            ? "border-slate-800 bg-[#070c18]/60"
            : "border-cyan-500/40 bg-[#091326]/60 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        )}
      >
        {selectedWords.length === 0 ? (
          <p className="text-xs text-slate-500 select-none">
            {mode === "translate"
              ? "Đang ở chế độ Tra nghĩa. Hãy chuyển sang Chế độ Xếp câu để kéo thả."
              : "Chạm vào các từ bên dưới để xếp thành câu..."}
          </p>
        ) : (
          selectedWords.map((token) => {
            const hasMeaning = revealedIds.has(token.id) && token.meaning;
            return (
              <button
                key={token.id}
                type="button"
                onClick={() => handleDeselectWord(token)}
                disabled={isAnswered}
                className="group relative px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#132342] to-[#0d1830] text-cyan-100 border border-cyan-400/40 hover:border-rose-400 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col items-center transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{token.text}</span>
                {hasMeaning && (
                  <span className="text-[10px] text-cyan-300/80 font-normal mt-0.5">
                    {token.meaning}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Word Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Kho từ vựng:</span>
          {mode === "translate" && (
            <span className="text-cyan-400 font-semibold animate-pulse">
              🔍 Chạm vào từ bất kỳ để nghe & xem nghĩa
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 p-4 bg-[#080d19] rounded-2xl border border-slate-800 min-h-[90px]">
          {availableWords.length === 0 ? (
            <p className="text-xs text-slate-500">Đã dùng hết tất cả các từ.</p>
          ) : (
            availableWords.map((token) => {
              const hasMeaning = revealedIds.has(token.id) && token.meaning;
              return (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => handleSelectWord(token)}
                  disabled={isAnswered}
                  className={cn(
                    "px-4 py-2.5 rounded-xl font-bold text-sm border transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center",
                    mode === "translate"
                      ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200 hover:bg-cyan-900/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      : "bg-[#0d162c] border-slate-700/80 hover:border-cyan-400/60 text-slate-100 hover:text-cyan-200 hover:bg-[#111e3b] shadow-sm"
                  )}
                >
                  <span>{token.text}</span>
                  {hasMeaning && (
                    <span className="text-[10px] text-cyan-300/80 font-normal mt-0.5">
                      {token.meaning}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Word Tooltip Popover */}
      {activeTooltip && (
        <div className="bg-[#0c162e] border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300 text-sm">
              {activeTooltip.word.text}:
            </span>
            <span className="text-slate-300">{activeTooltip.word.meaning}</span>
            {activeTooltip.loading && (
              <Loader2 size={12} className="animate-spin text-cyan-400" />
            )}
          </div>
          <button
            onClick={() => setActiveTooltip(null)}
            className="text-slate-500 hover:text-white text-xs px-1"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Grammar Rule Callout: Verb auf Position 2 */}
      <div className="bg-sky-950/20 border border-sky-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-sky-300">
        <Sparkles size={14} className="text-sky-400 flex-shrink-0" />
        <span>
          <strong>Quy tắc A1 cơ bản:</strong> Trong câu trần thuật tiếng Đức, động từ chia luôn đứng ở <strong>vị trí số 2</strong>.
        </span>
      </div>

      {/* Submit Button */}
      {!isAnswered && (
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={selectedWords.length === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Xếp lại từ đầu
          </button>
          <button
            type="button"
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 transition-all"
          >
            Kiểm tra câu
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
                  <span className="font-bold text-sm text-emerald-300">
                    Chính xác! Câu hoàn toàn đúng ngữ pháp 🎉
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-400" />
                  <span className="font-bold text-sm text-rose-300">
                    Vị trí từ chưa chuẩn! Hãy xem đáp án đúng bên dưới
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => handleSpeak(exercise.correctSentence)}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Nghe câu hoàn chỉnh"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="text-xs space-y-1.5 text-slate-300 bg-[#070d19]/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">
                  Câu đúng: <span className="text-cyan-300 font-bold">{exercise.correctSentence}</span>
                </p>
                <p className="text-slate-400 mt-1">{exercise.explanation}</p>
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
              <span>Tiếp tục Bước 3 (Viết câu AI)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
