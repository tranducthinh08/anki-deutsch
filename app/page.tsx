"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import WordList from "@/components/WordList";
import { AnkiCard } from "@/lib/anki";
import { RefreshCw, AlertCircle, Wifi, WifiOff, BookOpen, Sparkles, ArrowRight } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [ankiOnline, setAnkiOnline] = useState<boolean | null>(null);
  const [today, setToday] = useState("");
  const [origin, setOrigin] = useState("http://localhost:3000");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🇩🇪</div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                Anki Deutsch Practice
              </h1>
              <p className="text-xs text-slate-500">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Anki status indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {ankiOnline === true ? (
                <>
                  <Wifi size={13} className="text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Anki Online</span>
                </>
              ) : ankiOnline === false ? (
                <>
                  <WifiOff size={13} className="text-red-400" />
                  <span className="text-red-500 font-medium">Anki Offline</span>
                </>
              ) : null}
            </div>

            <button
              onClick={fetchTodayCards}
              disabled={status === "loading"}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={status === "loading" ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero banner for Deep Practice */}
        {status === "success" && cards.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold">
                <Sparkles size={13} />
                <span>Lộ trình A1 cho người mới bắt đầu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Luyện tập sâu từng từ vựng
              </h2>
              <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
                Trải nghiệm 3 bước: Điền từ vào chỗ trống → Sắp xếp câu hoàn chỉnh → Tự viết câu tiếng Đức đơn giản kèm từ khóa gợi ý.
              </p>
            </div>

            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
            >
              <span>Bắt đầu luyện tập ngay ({cards.length} từ)</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Stats bar */}
        {status === "success" && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
                <BookOpen size={16} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-800">
                  {cards.length} từ đã học hôm nay
                </span>
                {cards.length > 0 && <span className="text-base">🎉</span>}
              </div>
              {lastFetched && (
                <span className="text-xs text-slate-400">
                  Cập nhật: {formatTime(lastFetched)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {(status === "loading" || status === "idle") && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <RefreshCw size={36} className="animate-spin mb-4 text-indigo-400" />
            <p className="font-semibold text-slate-700">Đang kết nối Anki và tải từ vựng hôm nay...</p>
            <p className="text-xs text-slate-400 mt-1">Đảm bảo Anki đang mở và không có cửa sổ cài đặt nào đang chờ</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="max-w-lg mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <h2 className="font-bold text-red-700 mb-1">
              Không thể kết nối Anki
            </h2>
            <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
            <div className="text-left bg-white rounded-xl p-4 border border-red-100 text-xs text-slate-600 space-y-1.5 mb-4">
              <p className="font-semibold text-slate-700 mb-2">Cách khắc phục:</p>
              <p>1. Mở <strong>Anki Desktop</strong></p>
              <p>2. Cài add-on <strong>AnkiConnect</strong> (code: 2055492159)</p>
              <p>
                3. Vào <em>Tools → Add-ons → AnkiConnect → Config</em>, thêm{" "}
                <code className="bg-slate-100 px-1 rounded">
                  {origin}
                </code>{" "}
                vào <code className="bg-slate-100 px-1 rounded">webCorsOriginList</code>
              </p>
              <p>4. Khởi động lại Anki</p>
            </div>
            <button
              onClick={fetchTodayCards}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Word List (Review Dashboard) */}
        {status === "success" && <WordList cards={cards} />}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400 mt-12 border-t border-slate-100">
        Anki Deutsch Practice • Luyện tập tiếng Đức A1 thông minh cùng AnkiConnect & Gemini AI
      </footer>
    </div>
  );
}
