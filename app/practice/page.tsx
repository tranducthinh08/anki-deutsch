"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnkiCard } from "@/lib/anki";
import PracticeSession from "@/components/practice/PracticeSession";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PracticeContent() {
  const searchParams = useSearchParams();
  const targetWord = searchParams.get("word") ?? undefined;
  const targetIndex = searchParams.get("index") ? parseInt(searchParams.get("index")!, 10) : 0;

  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true);
        const res = await fetch("/api/anki/today");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Không thể lấy dữ liệu từ Anki");
        }
        setCards(data.cards ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi kết nối Anki");
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] bg-amber-mesh flex flex-col items-center justify-center p-4 text-slate-400">
        <div className="relative">
          <Loader2 size={40} className="animate-spin text-amber-400 mb-3" />
          <span className="absolute inset-0 rounded-full blur-md bg-amber-400/30 -z-10" />
        </div>
        <p className="text-sm font-bold text-slate-200">Đang chuẩn bị phiên luyện tập A1...</p>
        <p className="text-xs text-slate-500 mt-1">Đồng bộ từ vựng từ AnkiConnect</p>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#090a0f] bg-amber-mesh flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121524]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-amber-500/25 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/70 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-white">
            {cards.length === 0 ? "Chưa có từ nào hôm nay" : "Không thể tải từ vựng"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "Bạn chưa ôn tập từ nào trong Anki hôm nay. Hãy mở Anki Desktop và học vài thẻ trước nhé!"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-xs font-black rounded-2xl hover:from-amber-300 hover:to-yellow-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          >
            <ArrowLeft size={14} /> Về Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PracticeSession
      cards={cards}
      initialWord={targetWord}
      initialIndex={targetIndex}
    />
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-amber-400" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
