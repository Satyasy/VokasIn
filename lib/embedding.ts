// Server-only (Node.js). Menggunakan Google Gemini Embedding API
// Model: models/gemini-embedding-001 dengan outputDimensionality: 768.

export const EMBEDDING_MODEL = "models/gemini-embedding-001";
export const EMBEDDING_DIM = 768;

async function embedWithGemini(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables, using empty fallback vector");
    return new Array(EMBEDDING_DIM).fill(0);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      content: {
        parts: [{ text }],
      },
      outputDimensionality: EMBEDDING_DIM,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini embed API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.embedding?.values) {
    throw new Error("Gemini embed API returned invalid embedding structure");
  }

  return data.embedding.values;
}

export async function embedPassage(text: string): Promise<number[]> {
  return embedWithGemini(text);
}

export async function embedQuery(text: string): Promise<number[]> {
  return embedWithGemini(text);
}

// Format literal vector Postgres: "[0.1,0.2,...]".
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
