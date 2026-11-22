// app/api/anki/today/route.ts
import { NextResponse } from "next/server";
import { getTodayReviewedCardIds, getCardsInfo } from "@/lib/anki";

export async function GET() {
  const ankiUrl = process.env.ANKI_CONNECT_URL ?? "http://127.0.0.1:8765";

  try {
    const cardIds = await getTodayReviewedCardIds(ankiUrl);
    if (cardIds.length === 0) {
      return NextResponse.json({ cards: [], total: 0 });
    }

    const cards = await getCardsInfo(cardIds, ankiUrl);
    return NextResponse.json({ cards, total: cards.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Cannot connect to AnkiConnect. Make sure Anki is open.", detail: message },
      { status: 503 }
    );
  }
}
