// lib/progress.ts
// Quản lý và lưu trữ tiến độ học tập theo ngày vào localStorage

export interface WordProgress {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  completed: boolean;
  updatedAt?: number;
}

export type DayProgress = Record<string, WordProgress>;

export function normalizeWordKey(word: string): string {
  return word.trim().toLowerCase();
}

function getTodayKey(): string {
  const d = new Date();
  return `anki_progress_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

export function loadTodayProgress(): DayProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWordStep(
  word: string,
  step: 1 | 2 | 3,
  markFinished = false
): DayProgress {
  if (typeof window === "undefined") return {};
  try {
    const key = getTodayKey();
    const current = loadTodayProgress();
    const wordKey = normalizeWordKey(word);

    const existing: WordProgress = current[wordKey] || {
      step1: false,
      step2: false,
      step3: false,
      completed: false,
    };

    if (step === 1) existing.step1 = true;
    if (step === 2) existing.step2 = true;
    if (step === 3) existing.step3 = true;

    if (markFinished || (existing.step1 && existing.step2 && existing.step3)) {
      existing.completed = true;
    }

    existing.updatedAt = Date.now();
    current[wordKey] = existing;

    localStorage.setItem(key, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error("Failed to save progress to localStorage:", err);
    return {};
  }
}
