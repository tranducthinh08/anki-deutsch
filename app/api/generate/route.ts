// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePracticeSentence } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { germanWord, vietnameseMeaning } = await req.json();

    if (!germanWord) {
      return NextResponse.json(
        { error: "Missing germanWord" },
        { status: 400 }
      );
    }

    const sentence = await generatePracticeSentence(germanWord, vietnameseMeaning ?? "");
    return NextResponse.json({ sentence });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
