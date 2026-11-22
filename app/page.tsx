"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import WordList from "@/components/WordList";
import SpotlightCard from "@/components/SpotlightCard";
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
  Award,
  Layers,
  Compass,
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
    <div className="min-h-screen bg-[#090a0f] bg-amber-mesh text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      <div>
        {/* Floating Top Island Header */}
        <header className="sticky top-3 z-30 px-4">
          <div className="max-w-6xl mx-auto bg-[#121524]/90 backdrop-blur-2xl border border-amber-500/25 rounded-3xl px-5 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300/50">
                🇩🇪
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white">
                    DEUTSCH<span className="text-amber-400">FLOW</span>
                  </h1>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/30">
                    BAUHAUS GOLD
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">{today}</p>
              </div>
            </div>

            {/* Right Status & Refresh */}
            <div className="flex items-center gap-3">
              {/* Anki connection badge */}
              <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#0a0d17] border border-slate-800">
                {ankiOnline === true ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-emerald-300 font-bold text-[11px]">Anki Live</span>
                  </>
                ) : ankiOnline === false ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-rose-400 font-bold text-[11px]">Anki Offline</span>
                  </>
                ) : (
                  <span className="text-slate-500 text-[11px]">Đang kiểm tra...</span>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchTodayCards}
                disabled={status === "loading"}
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-40"
              >
                <RefreshCw size={13} className={status === "loading" ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Bento Box Grid Architecture */}
          {status === "success" && cards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Bento 1: Primary Command Center (Spans 2 columns) */}
              <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#161a29] via-[#111420] to-[#0c0e17] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-6">
                {/* Background ambient gold ray */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/30 text-xs font-bold">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Lộ trình Luyện Viết & Tư Duy Tiếng Đức A1</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    Làm chủ <span className="text-amber-400">{cards.length} từ vựng</span> hôm nay qua 3 bước
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Từ vựng chỉ thực sự thành của bạn khi bạn dùng nó để viết câu. Hệ thống tự động phân tách từ vựng thành chuỗi bài tập tương tác tăng dần độ khó.
                  </p>

                  {/* 3 Steps Mini Flowchart */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="bg-[#0e111d] border border-slate-800 rounded-2xl p-3 text-center">
                      <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                        1
                      </span>
                      <p className="text-xs font-bold text-slate-200">Điền từ ngữ cảnh</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Nhận diện mẫu câu</p>
                    </div>

                    <div className="bg-[#0e111d] border border-slate-800 rounded-2xl p-3 text-center">
                      <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                        2
                      </span>
                      <p className="text-xs font-bold text-slate-200">Xếp câu cú pháp</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Quy tắc V2 chuẩn</p>
                    </div>

                    <div className="bg-[#0e111d] border border-slate-800 rounded-2xl p-3 text-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center justify-center mb-1">
                        3
                      </span>
                      <p className="text-xs font-bold text-slate-200">Viết câu cùng AI</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Phản xạ bản xứ</p>
                    </div>
                  </div>
                </div>

                {/* Primary Workout CTA */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Tiến độ hôm nay</p>
                      <p className="text-sm font-bold text-white">
                        {completedCount} / {cards.length} từ đã hoàn thành ({completionPercent}%)
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/practice"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-sm font-black shadow-[0_0_30px_rgba(245,158,11,0.45)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    <Zap size={18} className="fill-slate-950" />
                    <span>BẮT ĐẦU BUỔI LUYỆN TẬP</span>
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>

              {/* Bento 2: Spotlight Word Widget (1 column) */}
              <div className="lg:col-span-1">
                <SpotlightCard cards={cards} />
              </div>
            </div>
          )}

          {/* Loading State */}
          {(status === "loading" || status === "idle") && (
            <div className="bg-[#121524]/60 border border-amber-500/20 rounded-3xl py-24 flex flex-col items-center justify-center text-slate-400 space-y-4 shadow-2xl">
              <div className="relative">
                <RefreshCw size={44} className="animate-spin text-amber-400" />
                <span className="absolute inset-0 rounded-full blur-md bg-amber-400/30 -z-10" />
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

              <div className="text-left bg-[#0c0f18] rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-amber-400 mb-1">Kiểm tra nhanh:</p>
                <p>1. Đảm bảo ứng dụng <strong>Anki Desktop</strong> đang chạy trên máy.</p>
                <p>2. Đảm bảo add-on <strong>AnkiConnect</strong> đã cài đặt (Code: <code>2055492159</code>).</p>
                <p>3. Không mở các cửa sổ cấu hình hoặc pop-up chờ nào trong Anki.</p>
              </div>

              <button
                onClick={fetchTodayCards}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg"
              >
                Thử kết nối lại
              </button>
            </div>
          )}

          {/* Word List (Review Dashboard with Grid & Flashcard Toggle) */}
          {status === "success" && <WordList cards={cards} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 bg-[#0c0e17]/60 backdrop-blur-md">
        <p className="font-medium text-slate-400">
          DeutschFlow • Luyện tập A1 thông minh cùng AnkiConnect & Gemini AI
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Aesthetic: Bauhaus Obsidian & Solar Amber • Bento Box Grid Architecture
        </p>
      </footer>
    </div>
  );
}
