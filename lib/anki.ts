// lib/anki.ts
// AnkiConnect client — gọi từ API route (server-side) hoặc trực tiếp từ browser

export interface AnkiCard {
  cardId: number;
  front: string;        // Tiếng Đức
  back: string;         // Nghĩa tiếng Việt
  deckName: string;
  tags: string[];
  interval: number;
  ease: number;
}

interface AnkiConnectRequest {
  action: string;
  version: number;
  params?: Record<string, unknown>;
}

async function ankiConnect<T>(
  action: string,
  params?: Record<string, unknown>,
  baseUrl = "http://127.0.0.1:8765"
): Promise<T> {
  const body: AnkiConnectRequest = { action, version: 6, params };
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`AnkiConnect HTTP error: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`AnkiConnect error: ${data.error}`);
  }
  return data.result as T;
}

/** Lấy danh sách card ID đã review hôm nay */
export async function getTodayReviewedCardIds(baseUrl?: string): Promise<number[]> {
  // rated:1 = reviewed today; prop:due=0 bỏ vì rated:1 đã đủ
  const cardIds = await ankiConnect<number[]>(
    "findCards",
    { query: "rated:1" },
    baseUrl
  );
  return cardIds ?? [];
}

/** Lấy giá trị field theo danh sách tên ưu tiên hoặc vị trí fallback */
function getFieldValue(
  fields: Record<string, { value: string }>,
  preferredNames: string[],
  fallbackIndex: number
): string {
  for (const name of preferredNames) {
    const foundKey = Object.keys(fields).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );
    if (foundKey && fields[foundKey]?.value) {
      return stripHtml(fields[foundKey].value);
    }
  }
  const values = Object.values(fields);
  return stripHtml(values[fallbackIndex]?.value ?? "");
}

/** Lấy thông tin chi tiết của các card và loại bỏ thẻ trùng */
export async function getCardsInfo(
  cardIds: number[],
  baseUrl?: string
): Promise<AnkiCard[]> {
  if (cardIds.length === 0) return [];

  const rawCards = await ankiConnect<
    Array<{
      cardId: number;
      deckName: string;
      fields: Record<string, { value: string }>;
      tags: string[];
      interval: number;
      factor: number;
    }>
  >("cardsInfo", { cards: cardIds }, baseUrl);

  // Map dùng để lọc trùng theo từ tiếng Đức (chuẩn hóa chữ thường + bỏ khoảng trắng)
  const uniqueMap = new Map<string, AnkiCard>();

  for (const c of rawCards) {
    const front = getFieldValue(
      c.fields,
      ["Front", "German", "Deutsch", "Word", "Từ"],
      0
    );
    const back = getFieldValue(
      c.fields,
      ["Back", "Meaning", "Vietnamese", "Nghĩa", "Tiếng Việt"],
      1
    );

    // Bỏ qua nếu không có từ vựng
    if (!front) continue;

    // Chuẩn hóa từ vựng để đối chiếu trùng lặp
    const normalizedKey = front.trim().toLowerCase();

    const cardData: AnkiCard = {
      cardId: c.cardId,
      front,
      back,
      deckName: c.deckName,
      tags: c.tags,
      interval: c.interval,
      ease: Math.round(c.factor / 10),
    };

    const existing = uniqueMap.get(normalizedKey);
    if (!existing) {
      uniqueMap.set(normalizedKey, cardData);
    } else {
      // Nếu thẻ trùng này có phần nghĩa (back) đầy đủ hơn thẻ trước đó, cập nhật thẻ này
      if (!existing.back && back) {
        uniqueMap.set(normalizedKey, cardData);
      }
    }
  }

  return Array.from(uniqueMap.values());
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/** Kiểm tra AnkiConnect có đang chạy không */
export async function checkAnkiConnect(baseUrl?: string): Promise<boolean> {
  try {
    await ankiConnect<number>("version", {}, baseUrl);
    return true;
  } catch {
    return false;
  }
}
