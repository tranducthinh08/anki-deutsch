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

  // Load persistent progress from localStorage
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

  // Fetch or retrieve practice package for current card
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

  // Handle saving individual step completion
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/40 pb-16">
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
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100/80 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                      {currentCard.front}
                    </span>
                    <button
                      onClick={() => handleSpeak(currentCard.front)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>

                  {/* Toggle meaning */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {showMeaning ? (
                      <p className="text-sm font-medium text-slate-600 animate-in fade-in">
                        {currentCard.back || "(Chưa có nghĩa tiếng Việt)"}
                      </p>
                    ) : (
                      <button
                        onClick={() => setShowMeaning(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
                      >
                        <Eye size={13} />
                        <span>Xem nghĩa tiếng Việt</span>
                      </button>
                    )}
                    {showMeaning && (
                      <button
                        onClick={() => setShowMeaning(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Ẩn nghĩa"
                      >
                        <EyeOff size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                    {currentCard.deckName.split("::").pop()}
                  </span>
                  {currentProgress.completed && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check size={11} /> Đã hoàn thành
                    </span>
                  )}
                </div>
              </div>

              {/* Step indicator tabs with live checkmarks */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                    currentStep === 1
                      ? "bg-blue-600 text-white shadow-sm"
                      : currentProgress.step1
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {currentProgress.step1 && <Check size={12} className={currentStep === 1 ? "text-white" : "text-emerald-600"} />}
                  <span>1. Điền từ</span>
                </button>

                <button
                  onClick={() => setCurrentStep(2)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                    currentStep === 2
                      ? "bg-purple-600 text-white shadow-sm"
                      : currentProgress.step2
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {currentProgress.step2 && <Check size={12} className={currentStep === 2 ? "text-white" : "text-emerald-600"} />}
                  <span>2. Xếp câu</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                    currentStep === 3
                      ? "bg-emerald-600 text-white shadow-sm"
                      : currentProgress.step3
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {currentProgress.step3 ? (
                    <Check size={12} className={currentStep === 3 ? "text-white" : "text-emerald-600"} />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>3. Viết câu</span>
                </button>
              </div>
            </div>

            {/* Exercise Content Area */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100/80 min-h-[340px] flex flex-col justify-center">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 size={32} className="animate-spin text-indigo-500" />
                  <p className="text-sm font-medium">Đang chuẩn bị bài tập A1 cho từ &quot;{currentCard.front}&quot;...</p>
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
                  <p className="text-sm text-red-500">Không tải được bài tập cho từ này.</p>
                  <button
                    onClick={() => loadPackageForCard(currentCard)}
                    className="text-xs px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg"
                  >
                    Thử tải lại
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Word Navigator */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-2">
              <button
                onClick={handlePrevWord}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 hover:text-slate-800 disabled:opacity-30 p-1"
              >
                <ChevronLeft size={16} /> Từ trước
              </button>

              <button
                onClick={handleNextWord}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold p-1"
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
