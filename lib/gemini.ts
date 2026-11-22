// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];

async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: unknown = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} failed, trying next...`, err);
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

export interface WordItem {
  de: string;
  vi: string;
}

export interface A1PracticePackage {
  fillBlank: {
    sentenceWithBlank: string;
    correctWord: string;
    options: Array<string | WordItem>;
    translation: string;
    explanation: string;
  };
  scramble: {
    words: Array<string | WordItem>;
    correctSentence: string;
    translation: string;
    explanation: string;
  };
  writing: {
    vietnameseSentence: string;
    suggestedGerman: string;
    hints: Array<{ de: string; vi: string }>;
  };
}

/** Dịch nhanh 1 từ tiếng Đức theo ngữ cảnh */
export async function translateWordQuick(
  word: string,
  contextSentence?: string
): Promise<{ word: string; meaning: string; note?: string }> {
  const context = contextSentence ? `trong câu: "${contextSentence}"` : "";
  const prompt = `Dịch từ tiếng Đức "${word}" ${context} sang tiếng Việt cho người mới học A1.
BẮT BUỘC chỉ trả về 1 chuỗi JSON hợp lệ:
{
  "word": "${word}",
  "meaning": "nghĩa tiếng Việt ngắn gọn, dễ hiểu nhất (1-3 từ)",
  "note": "ghi chú ngắn nếu có (ví dụ: động từ tách, giống đực der...)"
}`;

  const text = await generateWithFallback(prompt);
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { word, meaning: "Từ vựng tiếng Đức", note: "" };
  }
}

/** Sinh trọn bộ 3 bài tập A1 cho người mới bắt đầu kèm nghĩa chi tiết từng từ */
export async function generateA1PracticePackage(
  germanWord: string,
  vietnameseMeaning?: string
): Promise<A1PracticePackage> {
  const context = vietnameseMeaning
    ? `từ vựng tiếng Đức: "${germanWord}" (nghĩa: "${vietnameseMeaning}")`
    : `từ vựng tiếng Đức: "${germanWord}"`;

  const prompt = `Bạn là giáo viên tiếng Đức chuyên dạy cho người mới bắt đầu (Trình độ A1).
Học viên đang học ${context}.

Hãy tạo một gói bài tập 3 bước CỰC KỲ DỄ, CÂU NGẮN (3-6 từ), chuẩn ngữ pháp A1 đời sống.
ĐẶC BIỆT QUAN TRỌNG: Mọi từ tiếng Đức trong bài tập đều phải có nghĩa tiếng Việt kèm theo để người học bấm vào là xem được nghĩa ngay!

Yêu cầu định dạng: BẮT BUỘC chỉ trả về 1 chuỗi JSON hợp lệ (không có markdown code block, không giải thích ngoài JSON).

Cấu trúc JSON cần trả về:
{
  "fillBlank": {
    "sentenceWithBlank": "câu tiếng Đức A1 rất ngắn có chứa chỗ trống ___ (ví dụ: 'Ich ___ jetzt mit der Arbeit.')",
    "correctWord": "từ đúng cần điền vào chỗ trống",
    "options": [
      { "de": "từ đúng", "vi": "nghĩa tiếng Việt ngắn" },
      { "de": "từ gây nhiễu 1", "vi": "nghĩa tiếng Việt ngắn" },
      { "de": "từ gây nhiễu 2", "vi": "nghĩa tiếng Việt ngắn" },
      { "de": "từ gây nhiễu 3", "vi": "nghĩa tiếng Việt ngắn" }
    ],
    "translation": "nghĩa tiếng Việt của câu trên",
    "explanation": "giải thích ngắn gọn ngữ pháp bằng tiếng Việt (1 câu)"
  },
  "scramble": {
    "words": [
      { "de": "từ 1", "vi": "nghĩa tiếng Việt" },
      { "de": "từ 2", "vi": "nghĩa tiếng Việt" }
    ],
    "correctSentence": "câu hoàn chỉnh đúng trật tự ngữ pháp A1 (3-6 từ)",
    "translation": "nghĩa tiếng Việt của câu này",
    "explanation": "giải thích ngắn gọn vị trí động từ số 2 hoặc cấu trúc câu"
  },
  "writing": {
    "vietnameseSentence": "câu tiếng Việt cực ngắn và dễ hiểu (3-5 từ) để học viên tự dịch sang tiếng Đức",
    "suggestedGerman": "câu tiếng Đức mẫu chuẩn A1 tương ứng",
    "hints": [
      { "de": "từ gợi ý 1", "vi": "nghĩa tiếng Việt" },
      { "de": "từ gợi ý 2", "vi": "nghĩa tiếng Việt" }
    ]
  }
}

LƯU Ý:
1. Trong 'scramble.words': MỖI PHẦN TỬ là một object { "de": "...", "vi": "..." } chứa từ và nghĩa tiếng Việt của từ đó.
2. Trong 'fillBlank.options': MỖI PHẦN TỬ là một object { "de": "...", "vi": "..." } chứa từ và nghĩa tiếng Việt của nó.`;

  const text = await generateWithFallback(prompt);

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const data: A1PracticePackage = JSON.parse(cleaned);
    return data;
  } catch (err) {
    console.error("Failed to parse A1 practice package JSON:", text, err);
    // Fallback nếu JSON bị lỗi nhẹ
    return {
      fillBlank: {
        sentenceWithBlank: `Ich möchte jetzt ${germanWord} ___.`,
        correctWord: germanWord,
        options: [
          { de: germanWord, vi: vietnameseMeaning || "từ này" },
          { de: "machen", vi: "làm" },
          { de: "gehen", vi: "đi" },
          { de: "kommen", vi: "đến" },
        ],
        translation: `Tôi muốn ${vietnameseMeaning || germanWord} bây giờ.`,
        explanation: `Động từ nguyên mẫu đứng ở cuối câu sau động từ khuyết thiếu.`,
      },
      scramble: {
        words: [
          { de: "Ich", vi: "tôi" },
          { de: "muss", vi: "phải" },
          { de: "jetzt", vi: "bây giờ" },
          { de: germanWord, vi: vietnameseMeaning || germanWord },
        ],
        correctSentence: `Ich muss jetzt ${germanWord}.`,
        translation: `Tôi phải ${vietnameseMeaning || germanWord} bây giờ.`,
        explanation: `Động từ khuyết thiếu 'muss' ở vị trí 2, động từ chính ở cuối câu.`,
      },
      writing: {
        vietnameseSentence: `Tôi muốn ${vietnameseMeaning || germanWord}.`,
        suggestedGerman: `Ich möchte ${germanWord}.`,
        hints: [
          { de: "ich", vi: "tôi" },
          { de: "möchte", vi: "muốn" },
          { de: germanWord, vi: vietnameseMeaning || germanWord },
        ],
      },
    };
  }
}

/** Tạo câu mẫu tiếng Việt để luyện viết câu tiếng Đức */
export async function generatePracticeSentence(
  germanWord: string,
  vietnameseMeaning?: string
): Promise<string> {
  const context = vietnameseMeaning
    ? `từ tiếng Đức: "${germanWord}" (nghĩa tiếng Việt: "${vietnameseMeaning}")`
    : `từ tiếng Đức: "${germanWord}"`;

  const prompt = `Bạn là giáo viên tiếng Đức. Học viên vừa học ${context}.

Hãy tạo 1 câu mẫu ngắn bằng tiếng Việt để học viên dịch sang tiếng Đức có sử dụng từ này trong đời sống hàng ngày (gia đình, mua sắm, công việc, bạn bè...).
Yêu cầu:
- Câu tự nhiên, ngắn gọn (8-15 từ)
- CHỈ trả về đúng 1 câu tiếng Việt, không giải thích thêm, không có dấu ngoặc kép.

Ví dụ format: Tôi muốn dừng công việc lại để nghỉ ngơi một chút.`;

  return generateWithFallback(prompt);
}

/** Kiểm tra câu tiếng Đức của học viên (Ân cần, định hướng cho người mới học A1) */
export async function checkGermanSentence(
  germanWord: string,
  vietnameseSentence: string,
  studentAnswer: string
): Promise<{ correct: boolean; feedback: string; suggestion: string }> {
  const prompt = `Bạn là giáo viên tiếng Đức thân thiện, ân cần giảng dạy cho học viên trình độ A1 mới bắt đầu.
Học viên được yêu cầu dịch câu tiếng Việt: "${vietnameseSentence}"
Có chứa từ vựng đang học: "${germanWord}"

Câu học viên đã viết: "${studentAnswer}"

Nhiệm vụ:
1. Đánh giá xem câu học viên viết đã đúng ngữ pháp A1 cơ bản chưa (vị trí động từ số 2, chia động từ theo ngôi, viết hoa danh từ nếu có). Chấp nhận các cách diễn đạt tương đương tự nhiên.
2. Viết nhận xét ngắn gọn, khích lệ, chỉ ra điểm làm tốt và giải thích nhẹ nhàng lỗi sai (nếu có).
3. Đưa ra câu tiếng Đức chuẩn nhất.

BẮT BUỘC trả về DUY NHẤT định dạng JSON:
{
  "correct": true/false,
  "feedback": "nhận xét bằng tiếng Việt ngắn gọn, khích lệ và chỉ dẫn ngữ pháp dễ hiểu",
  "suggestion": "câu tiếng Đức chuẩn xác"
}`;

  const text = await generateWithFallback(prompt);

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const json = JSON.parse(cleaned);
    return json;
  } catch {
    return {
      correct: false,
      feedback: text || "Không thể phân tích câu trả lời.",
      suggestion: "",
    };
  }
}
