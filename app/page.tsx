"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import WordList from "@/components/WordList";
import { AnkiCard } from "@/lib/anki";
import { loadTodayProgress, normalizeWordKey, DayProgress } from "@/lib/progress";
import {
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  BookOpen,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Flame,
  Award,
} from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [ankiOnline, setAnkiOnline] = useState<boolean | null>(null);
  const [today, setToday] = useState("");
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [dayProgress, setDayProgress] = useState<DayProgress>({});

  const fetchTodayCards = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/anki/today");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Unknown error");
      }

      setCards(data.cards);
      setStatus("success");
      setAnkiOnline(true);
      setLastFetched(new Date());
      setDayProgress(loadTodayProgress());
    } catch (err) {
      setStatus("error");
      setAnkiOnline(false);
      setErrorMsg(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  }, []);

  useEffect(() => {
    fetchTodayCards();
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setDayProgress(loadTodayProgress());
    }
    setToday(
      new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, [fetchTodayCards]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const completedCount = useMemo(() => {
    return cards.filter((c) => dayProgress[normalizeWordKey(c.front)]?.completed).length;
  }, [cards, dayProgress]);

  const completionPercent = cards.length > 0 ? Math.round((completedCount / cards.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#060913] bg-cyber-grid text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      <div>
        {/* Floating Cyber Header */}
        <header className="sticky top-0 z-30 bg-[#080d19]/80 backdrop-blur-xl border-b border-sky-500/15">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40">
                🇩🇪
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white">
                    DEUTSCH<span className="text-cyan-400">FLOW</span>
                  </h1>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    A1 ENGINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">{today}</p>
              </div>
            </div>

            {/* Right Status & Refresh */}
            <div className="flex items-center gap-3">
              {/* Anki connection badge */}
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#0c1427] border border-slate-800">
                {ankiOnline === true ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                    <span className="text-cyan-300 font-semibold text-[11px]">Anki Live</span>
                  </>
                ) : ankiOnline === false ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-rose-400 font-semibold text-[11px]">Anki Offline</span>
                  </>
                ) : (
                  <span className="text-slate-500 text-[11px]">Đang kiểm tra...</span>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchTodayCards}
                disabled={status === "loading"}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] disabled:opacity-40"
              >
                <RefreshCw size={13} className={status === "loading" ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Command Center Hero Dashboard */}
          {status === "success" && cards.length > 0 && (
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0c162e] via-[#091326] to-[#080d19] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(6,182,212,0.25)] space-y-6">
              {/* Background ambient spotlight */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                {/* Left Description */}
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                    <Sparkles size={13} className="text-cyan-400" />
                    <span>Lộ trình Luyện Viết & Phản Xạ A1 Tự Động</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    Luyện tập sâu từ vựng hôm nay
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Hệ thống tự động đồng bộ <strong className="text-cyan-300">{cards.length} từ vựng</strong> bạn vừa ôn trong Anki và phân giải thành 3 bài tập thực hành: <span className="text-slate-100 font-medium">Điền từ ngữ cảnh ➔ Sắp xếp câu hoàn chỉnh ➔ AI Đánh giá câu tự sáng tác</span>.
                  </p>
                </div>

                {/* Right Action Hub */}
                <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                  <Link
                    href="/practice"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-sm font-extrabold shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    <Zap size={18} className="fill-slate-950" />
                    <span>BẮT ĐẦU WORKOUT ({cards.length} TỪ)</span>
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Progress & Stats Strip */}
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#060b17]/80 rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Đã học trong Anki</p>
                    <p className="text-lg font-bold text-white">{cards.length} từ</p>
                  </div>
                </div>

                <div className="bg-[#060b17]/80 rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400">Đã hoàn thành</p>
                      <span className="text-xs font-bold text-emerald-400">{completionPercent}%</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {completedCount} <span className="text-xs text-slate-400 font-normal">/ {cards.length} từ</span>
                    </p>
                  </div>
                </div>

                <div className="bg-[#060b17]/80 rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Target size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Cập nhật gần nhất</p>
                    <p className="text-sm font-semibold text-slate-200">
                      {lastFetched ? formatTime(lastFetched) : "Chưa có"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(status === "loading" || status === "idle") && (
            <div className="bg-[#0c1427]/60 border border-sky-500/20 rounded-3xl py-24 flex flex-col items-center justify-center text-slate-400 space-y-4 shadow-2xl">
              <div className="relative">
                <RefreshCw size={42} className="animate-spin text-cyan-400" />
                <span className="absolute inset-0 rounded-full blur-md bg-cyan-400/30 -z-10" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-white text-base">Đang kết nối Anki Desktop...</p>
                <p className="text-xs text-slate-400">Đang quét các thẻ ôn tập hôm nay từ AnkiConnect (127.0.0.1:8765)</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="max-w-xl mx-auto bg-rose-950/30 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <AlertCircle size={30} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Chưa kết nối được với Anki Desktop</h3>
                <p className="text-xs text-rose-300">{errorMsg}</p>
              </div>

              <div className="text-left bg-[#070d19] rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-cyan-300 mb-1">Kiểm tra nhanh:</p>
                <p>1. Đảm bảo ứng dụng <strong>Anki Desktop</strong> đang chạy trên máy.</p>
                <p>2. Đảm bảo add-on <strong>AnkiConnect</strong> đã cài đặt (Code: <code>2055492159</code>).</p>
                <p>
                  3. Không mở các cửa sổ cấu hình hoặc pop-up chờ nào trong Anki.
                </p>
              </div>

              <button
                onClick={fetchTodayCards}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                Thử kết nối lại
              </button>
            </div>
          )}

          {/* Word List (Review Dashboard) */}
          {status === "success" && <WordList cards={cards} />}
        </main>
      </div>

      {/* Cyber Footer */}
      <footer className="mt-16 py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 bg-[#070d1a]/50 backdrop-blur-md">
        <p className="font-medium">
          DeutschFlow • Luyện tập A1 thông minh cùng AnkiConnect & Gemini AI
        </p>
        <p className="text-[11px] text-slate-600 mt-1">Design System: Midnight Cyber Blue & OLED Dark</p>
      </footer>
    </div>
  );
}
