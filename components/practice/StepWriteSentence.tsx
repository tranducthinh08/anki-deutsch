"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Volume2, ArrowRight, Loader2, Sparkles, HelpCircle, Lightbulb } from "lucide-react";
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
      utter.rate = 0.9;
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
      {/* Exercise Subtitle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
            3
          </span>
          <h3 className="text-sm font-bold text-slate-200">
            Tự viết câu tiếng Đức (AI Phản biện ngữ pháp)
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
          Sáng tạo câu A1
        </span>
      </div>

      {/* Target Vietnamese Prompt */}
      <div className="bg-[#0e111d] border border-amber-500/25 rounded-3xl p-6 text-center space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <p className="text-xs text-slate-400">Hãy viết câu tiếng Đức cho ý sau:</p>
        <p className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">
          &quot;{exercise.vietnameseSentence}&quot;
        </p>
        <p className="text-xs text-slate-500 pt-1">
          Bắt buộc sử dụng từ khóa: <strong className="text-amber-400 font-bold">{germanWord}</strong>
        </p>
      </div>

      {/* Vocabulary Hints */}
      {exercise.hints && exercise.hints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 px-1 flex items-center gap-1.5">
            <HelpCircle size={13} className="text-amber-400" />
            <span>Từ khóa gợi ý (Chạm để chèn vào câu):</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.hints.map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertHint(hint.de)}
                className="px-3.5 py-1.5 rounded-2xl bg-[#141829] hover:bg-[#1c223a] border border-slate-700/80 hover:border-amber-400/60 text-xs text-slate-200 transition-all flex items-center gap-1.5 shadow-sm group"
                title={`Nghĩa: ${hint.vi}`}
              >
                <span className="font-bold text-amber-300 group-hover:text-amber-200">{hint.de}</span>
                <span className="text-[10px] text-slate-500 font-normal">({hint.vi})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Writing Textarea */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            rows={3}
            placeholder="Gõ câu tiếng Đức của bạn ở đây... (Ví dụ: Ich höre jetzt auf.)"
            className="w-full p-4 rounded-3xl bg-[#0a0d18] border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white font-medium text-base sm:text-lg placeholder:text-slate-600 transition-all shadow-inner focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{studentAnswer.trim().split(/\s+/).filter(Boolean).length} từ</span>
          <button
            type="button"
            onClick={handleCheck}
            disabled={loading || !studentAnswer.trim()}
            className="px-6 py-2.5 rounded-2xl font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-40 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin text-slate-950" />
                <span>AI đang chấm điểm...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="fill-slate-950" />
                <span>AI Đánh Giá Câu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Evaluation Feedback Card */}
      {result && (
        <div
          className={cn(
            "p-5 sm:p-6 rounded-3xl border space-y-4 animate-in fade-in zoom-in-95 duration-200",
            result.correct
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/30 border-rose-500/30 text-rose-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.correct ? (
                <>
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span className="font-extrabold text-sm text-emerald-300">
                    Rất tuyệt vời! Câu chuẩn A1 🎉
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={20} className="text-rose-400" />
                  <span className="font-extrabold text-sm text-rose-300">
                    Cần chỉnh sửa một chút! Hãy xem góp ý bên dưới
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => handleSpeak(studentAnswer)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Nghe câu bạn vừa viết"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="bg-[#0a0d18] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed font-medium">
              {result.feedback}
            </p>

            {result.suggestion && (
              <div className="pt-2 border-t border-slate-800 flex items-start gap-2">
                <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-400">Câu gợi ý chuẩn từ giáo viên bản xứ:</p>
                  <p className="text-amber-300 font-bold text-sm mt-0.5">
                    {result.suggestion}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onComplete}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all"
            >
              <span>Hoàn tất từ này &amp; Chuyển tiếp</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
