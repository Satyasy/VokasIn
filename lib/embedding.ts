// Server-only (Node.js proses panjang — dev server / server start, BUKAN
// Vercel serverless/edge function: model ONNX + cold start tidak proporsional
// di sana). Jangan import dari client component.
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

// Dicatat eksplisit (bukan dipakai diam-diam) supaya kalau model ganti, jelas
// baris unit_kompetensi mana yang embedding_model_version-nya basi dan perlu
// di-re-embed.
export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";
export const EMBEDDING_DIM = 384;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  // Singleton: dimuat sekali per proses Node, bukan tiap request.
  extractorPromise ??= pipeline("feature-extraction", EMBEDDING_MODEL, {
    dtype: "q8", // varian ONNX quantized — lebih kecil & lebih cepat di CPU
  });
  return extractorPromise;
}

// Model E5 WAJIB prefix teks sebelum di-embed, atau kualitas pencarian turun
// drastis TANPA error yang terlihat. "passage: " untuk teks korpus (unit
// kompetensi), "query: " untuk pencarian bebas guru. JANGAN dihapus.
async function embed(text: string, prefix: "passage: " | "query: "): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(prefix + text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

export function embedPassage(text: string): Promise<number[]> {
  return embed(text, "passage: ");
}

export function embedQuery(text: string): Promise<number[]> {
  return embed(text, "query: ");
}

// Format literal vector Postgres: "[0.1,0.2,...]".
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
