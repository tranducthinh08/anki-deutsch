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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Đang tải danh sách từ vựng hôm nay...</p>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertCircle size={40} className="text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">
            {cards.length === 0 ? "Chưa có từ nào hôm nay" : "Không thể tải từ vựng"}
          </h2>
          <p className="text-xs text-slate-500">
            {error || "Bạn chưa ôn tập từ nào trong Anki hôm nay. Hãy mở Anki và ôn bài trước nhé!"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-indigo-600" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
