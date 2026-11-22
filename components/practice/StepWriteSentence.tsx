"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Volume2, ArrowRight, Loader2, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepWriteSentenceProps {
  germanWord: string;
  exercise: {
    vietnameseSentence: string;
    suggestedGerman: string;
    hints: Array<{ de: string; vi: string }>;
  };
  isStepDone?: boolean;
  onStepSuccess?: () => void;
  onComplete: () => void;
}

interface CheckResult {
  correct: boolean;
  feedback: string;
  suggestion: string;
}

export default function StepWriteSentence({
  germanWord,
  exercise,
  isStepDone = false,
  onStepSuccess,
  onComplete,
}: StepWriteSentenceProps) {
  const [studentAnswer, setStudentAnswer] = useState(
    isStepDone ? exercise.suggestedGerman : ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(
    isStepDone
      ? {
          correct: true,
          feedback: "Bạn đã hoàn thành câu này trước đó!",
          suggestion: exercise.suggestedGerman,
        }
      : null
  );

  const handleCheck = async () => {
    if (!studentAnswer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          germanWord,
          vietnameseSentence: exercise.vietnameseSentence,
          studentAnswer,
        }),
      });
      const data: CheckResult = await res.json();
      setResult(data);
      if (data.correct) {
        onStepSuccess?.();
      }
    } catch {
      setResult({
        correct: false,
        feedback: "Không thể kết nối với dịch vụ kiểm tra câu.",
        suggestion: exercise.suggestedGerman,
      });
    } finally {
      setLoading(false);
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

  const insertHint = (deWord: string) => {
    setStudentAnswer((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${deWord}` : deWord;
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h3 className="font-semibold text-slate-800 text-base">
            Bước 3: Tự viết câu tiếng Đức (A1 Dễ)
          </h3>
        </div>
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
          Áp dụng thực tế
        </span>
      </div>

      {/* Target Vietnamese sentence */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
          Hãy dịch câu sau sang tiếng Đức:
        </p>
        <p className="text-xl sm:text-2xl font-bold text-slate-800">
          &ldquo;{exercise.vietnameseSentence}&rdquo;
        </p>
      </div>

      {/* Vocabulary Hints Bank */}
      {exercise.hints && exercise.hints.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <HelpCircle size={14} className="text-indigo-500" />
            <span>Gợi ý từ vựng (chạm để chèn vào ô viết):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {exercise.hints.map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertHint(hint.de)}
                className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                title={`Chèn "${hint.de}"`}
              >
                <strong className="text-indigo-700 font-semibold">{hint.de}</strong>
                <span className="text-slate-400">({hint.vi})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Textarea */}
      <div className="space-y-3">
        <textarea
          value={studentAnswer}
          onChange={(e) => {
            setStudentAnswer(e.target.value);
            setResult(null);
          }}
          placeholder="Viết câu tiếng Đức của bạn ở đây (ví dụ: Ich...)..."
          rows={3}
          className="w-full bg-white text-slate-900 font-medium placeholder:text-slate-400 border border-slate-300 focus:border-indigo-500 rounded-2xl p-4 text-base focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none shadow-sm"
        />

        <button
          onClick={handleCheck}
          disabled={loading || !studentAnswer.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          <span>{loading ? "AI đang chấm và nhận xét..." : "Chấm điểm & Nhận xét với AI ✨"}</span>
        </button>
      </div>

      {/* AI Feedback */}
      {result && (
        <div
          className={cn(
            "p-5 rounded-2xl border space-y-3 transition-all",
            result.correct
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-amber-50 border-amber-200 text-amber-950"
          )}
        >
          <div className="flex items-center gap-2 font-bold text-base">
            {result.correct ? (
              <>
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span className="text-emerald-800">Làm rất tốt! Câu chuẩn xác 🎉</span>
              </>
            ) : (
              <>
                <XCircle size={20} className="text-amber-600" />
                <span className="text-amber-800">Cố lên! Cần chỉnh sửa một chút:</span>
              </>
            )}
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-black/5">
            {result.feedback}
          </p>

          {result.suggestion && (
            <div className="flex items-center justify-between gap-2 bg-white/90 p-3 rounded-xl border border-black/5">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 font-semibold">💡 Câu tiếng Đức chuẩn mẫu:</p>
                <p className="text-sm font-bold text-indigo-700">{result.suggestion}</p>
              </div>
              <button
                onClick={() => handleSpeak(result.suggestion)}
                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Nghe phát âm"
              >
                <Volume2 size={18} />
              </button>
            </div>
          )}

          {/* Complete button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <span>Hoàn thành từ này</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
