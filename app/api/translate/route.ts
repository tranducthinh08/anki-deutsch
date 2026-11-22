// app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { translateWordQuick } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { word, contextSentence } = await req.json();

    if (!word) {
      return NextResponse.json(
        { error: "Missing word" },
        { status: 400 }
      );
    }

    const result = await translateWordQuick(word, contextSentence);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
