"use client";

import { useState, useEffect, useCallback } from "react";
import { AnkiCard } from "@/lib/anki";
import { A1PracticePackage } from "@/lib/gemini";
import {
  loadTodayProgress,
  saveWordStep,
  normalizeWordKey,
  DayProgress,
} from "@/lib/progress";
import PracticeHeader from "./PracticeHeader";
import StepFillBlank from "./StepFillBlank";
import StepScramble from "./StepScramble";
import StepWriteSentence from "./StepWriteSentence";
import WordDrawer from "./WordDrawer";
import CompletionCelebration from "./CompletionCelebration";
import {
  Volume2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticeSessionProps {
  cards: AnkiCard[];
  initialWord?: string;
  initialIndex?: number;
}

export default function PracticeSession({
  cards,
  initialWord,
  initialIndex = 0,
}: PracticeSessionProps) {
  const getStartingIndex = () => {
    if (initialWord) {
      const idx = cards.findIndex(
        (c) => c.front.trim().toLowerCase() === initialWord.trim().toLowerCase()
      );
      if (idx !== -1) return idx;
    }
    return Math.min(Math.max(0, initialIndex), Math.max(0, cards.length - 1));
  };

  const [currentIndex, setCurrentIndex] = useState(getStartingIndex());
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [dayProgress, setDayProgress] = useState<DayProgress>({});
  const [cache, setCache] = useState<Record<number, A1PracticePackage>>({});
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    setDayProgress(loadTodayProgress());
  }, []);

  const currentCard = cards[currentIndex];
  const currentWordKey = currentCard ? normalizeWordKey(currentCard.front) : "";
  const currentProgress = dayProgress[currentWordKey] || {
    step1: false,
    step2: false,
    step3: false,
    completed: false,
  };

  const loadPackageForCard = useCallback(
    async (card: AnkiCard) => {
      if (cache[card.cardId]) return;

      setLoading(true);
      try {
        const res = await fetch("/api/practice/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            germanWord: card.front,
            vietnameseMeaning: card.back,
          }),
        });

        if (!res.ok) throw new Error("Failed to load practice package");
        const data: A1PracticePackage = await res.json();
        setCache((prev) => ({ ...prev, [card.cardId]: data }));
      } catch (err) {
        console.error("Error loading practice package:", err);
      } finally {
        setLoading(false);
      }
    },
    [cache]
  );

  useEffect(() => {
    if (currentCard) {
      loadPackageForCard(currentCard);
      setCurrentStep(1);
      setShowMeaning(false);
    }
  }, [currentIndex, currentCard, loadPackageForCard]);

  const handleStepSuccess = (step: 1 | 2 | 3) => {
    if (!currentCard) return;
    const updated = saveWordStep(currentCard.front, step, step === 3);
    setDayProgress(updated);
  };

  const handleNextWord = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsAllDone(true);
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleWordFinished = () => {
    if (currentCard) {
      handleStepSuccess(3);
    }
    handleNextWord();
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      utter.rate = 0.9;
      utter.onstart = () => setIsPlayingAudio(true);
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-20 text-slate-400">
        Không có từ vựng nào để luyện tập hôm nay.
      </div>
    );
  }

  const pkg = cache[currentCard.cardId];
  const completedCount = cards.filter(
    (c) => dayProgress[normalizeWordKey(c.front)]?.completed
  ).length;

  return (
    <div className="min-h-screen bg-[#060913] bg-cyber-grid text-slate-100 pb-16 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <PracticeHeader
        currentIndex={currentIndex}
        totalCards={cards.length}
        completedCount={completedCount}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {isAllDone ? (
          <CompletionCelebration
            totalWords={cards.length}
            onRestart={() => {
              setCurrentIndex(0);
              setCurrentStep(1);
              setIsAllDone(false);
            }}
          />
        ) : (
          <>
            {/* Word Focus Card */}
            <div className="relative overflow-hidden bg-[#0c1427]/85 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-6 shadow-2xl space-y-5">
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {currentCard.front}
                    </span>
                    <button
                      onClick={() => handleSpeak(currentCard.front)}
                      className={`p-1.5 rounded-full border transition-all ${
                        isPlayingAudio
                          ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50"
                      }`}
                      title="Phát âm tiếng Đức"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  {/* Toggle meaning */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {showMeaning ? (
                      <div className="bg-[#070d19] border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                        <span className="text-xs font-semibold text-cyan-200">
                          {currentCard.back || "(Chưa có nghĩa tiếng Việt)"}
                        </span>
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
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Eye size={13} />
                        <span>Xem nghĩa tiếng Việt</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-bold bg-cyan-950/60 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-800/50">
                    {currentCard.deckName.split("::").pop() || "A1"}
                  </span>
                  {currentProgress.completed && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Check size={11} /> Đã hoàn thành
                    </span>
                  )}
                </div>
              </div>

              {/* Step indicator tabs */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border",
                    currentStep === 1
                      ? "bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : currentProgress.step1
                      ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                      : "bg-[#070d19] text-slate-400 border-slate-800 hover:text-slate-200"
                  )}
                >
                  {currentProgress.step1 && <Check size={12} className="text-emerald-400" />}
                  <span>1. Điền từ</span>
                </button>

                <button
                  onClick={() => setCurrentStep(2)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border",
                    currentStep === 2
                      ? "bg-sky-500/25 text-sky-200 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                      : currentProgress.step2
                      ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                      : "bg-[#070d19] text-slate-400 border-slate-800 hover:text-slate-200"
                  )}
                >
                  {currentProgress.step2 && <Check size={12} className="text-emerald-400" />}
                  <span>2. Xếp câu</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border",
                    currentStep === 3
                      ? "bg-blue-500/25 text-blue-200 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : currentProgress.step3
                      ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                      : "bg-[#070d19] text-slate-400 border-slate-800 hover:text-slate-200"
                  )}
                >
                  {currentProgress.step3 ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Sparkles size={12} className="text-cyan-400" />
                  )}
                  <span>3. Viết câu</span>
                </button>
              </div>
            </div>

            {/* Exercise Content Area */}
            <div className="bg-[#0c1427]/80 backdrop-blur-xl border border-sky-500/15 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[340px] flex flex-col justify-center">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 size={34} className="animate-spin text-cyan-400" />
                  <p className="text-xs font-medium text-slate-300">
                    Đang khởi tạo bài tập A1 cho &quot;{currentCard.front}&quot;...
                  </p>
                </div>
              ) : pkg ? (
                <div>
                  {currentStep === 1 && (
                    <StepFillBlank
                      exercise={pkg.fillBlank}
                      isStepDone={currentProgress.step1}
                      onStepSuccess={() => handleStepSuccess(1)}
                      onComplete={() => setCurrentStep(2)}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepScramble
                      exercise={pkg.scramble}
                      isStepDone={currentProgress.step2}
                      onStepSuccess={() => handleStepSuccess(2)}
                      onComplete={() => setCurrentStep(3)}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepWriteSentence
                      germanWord={currentCard.front}
                      exercise={pkg.writing}
                      isStepDone={currentProgress.step3}
                      onStepSuccess={() => handleStepSuccess(3)}
                      onComplete={handleWordFinished}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <p className="text-xs text-rose-400">Không tải được bài tập cho từ này.</p>
                  <button
                    onClick={() => loadPackageForCard(currentCard)}
                    className="text-xs px-4 py-2 bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 font-semibold rounded-xl"
                  >
                    Thử tải lại
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Word Navigator */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-2">
              <button
                onClick={handlePrevWord}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 hover:text-white disabled:opacity-30 p-1 transition-colors"
              >
                <ChevronLeft size={16} /> Từ trước
              </button>

              <button
                onClick={handleNextWord}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold p-1 transition-colors"
              >
                <span>{currentIndex === cards.length - 1 ? "Xem kết quả" : "Bỏ qua / Từ tiếp theo"}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Drawer */}
      <WordDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cards={cards}
        currentIndex={currentIndex}
        dayProgress={dayProgress}
        onSelectWord={(index) => {
          setCurrentIndex(index);
          setCurrentStep(1);
        }}
      />
    </div>
  );
}
