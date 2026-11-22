// app/api/practice/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateA1PracticePackage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { germanWord, vietnameseMeaning } = await req.json();

    if (!germanWord) {
      return NextResponse.json(
        { error: "Missing germanWord parameter" },
        { status: 400 }
      );
    }

    const practicePackage = await generateA1PracticePackage(
      germanWord,
      vietnameseMeaning ?? ""
    );

    return NextResponse.json(practicePackage);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in /api/practice/generate:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
