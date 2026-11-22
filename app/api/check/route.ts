// app/api/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkGermanSentence } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { germanWord, vietnameseSentence, studentAnswer } = await req.json();

    if (!germanWord || !vietnameseSentence || !studentAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await checkGermanSentence(germanWord, vietnameseSentence, studentAnswer);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
