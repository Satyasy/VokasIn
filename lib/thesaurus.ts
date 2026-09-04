// Modul Tesaurus Vokasi & Intelligent Query Expansion
// Memperkaya istilah mata pelajaran SMK dengan padanan kata resmi SKKNI dan taksonomi industri

export const VOCATIONAL_THESAURUS: Record<string, string[]> = {
  jaringan: [
    "server",
    "cloud computing",
    "tautan wan",
    "layanan ip",
    "routing",
    "switching",
    "infrastruktur jaringan",
    "konfigurasi server",
  ],
  network: [
    "server",
    "cloud",
    "wan",
    "lan",
    "ip network",
    "routing",
  ],
  server: [
    "instalasi server",
    "konfigurasi server",
    "uji server",
    "sistem operasi jaringan",
    "cloud computing",
  ],
  ai: [
    "artificial intelligence",
    "kecerdasan buatan",
    "solusi ai",
    "machine learning",
    "sasaran bisnis ai",
  ],
  "kecerdasan buatan": [
    "artificial intelligence",
    "solusi ai",
    "machine learning",
    "deep learning",
  ],
  cloud: [
    "cloud computing",
    "perangkat keras cloud",
    "sistem cloud",
    "gangguan sistem cloud",
    "virtualisasi",
  ],
  komputasi: [
    "cloud computing",
    "perangkat keras",
    "sistem komputer",
  ],
  iot: [
    "internet of things",
    "device iot",
    "sensor",
    "mikrokontroler",
    "embedded system",
    "uji coba device",
  ],
  "basis data": [
    "database",
    "sql",
    "relasional",
    "ddl",
    "dml",
    "perancangan basis data",
    "manajemen data",
  ],
  database: [
    "basis data",
    "sql",
    "query",
    "tabel relasional",
    "manajemen data",
  ],
  web: [
    "pemrograman web",
    "frontend",
    "backend",
    "rest api",
    "software tools",
    "aplikasi web",
  ],
  proyek: [
    "software management tools",
    "proyek perangkat lunak",
    "manajemen proyek",
    "pengelolaan proyek",
  ],
  "software engineering": [
    "rekayasa perangkat lunak",
    "software tools",
    "pengembangan aplikasi",
  ],
  keamanan: [
    "cyber security",
    "keamanan jaringan",
    "antisipasi gangguan",
    "ancaman sistem",
    "firewall",
  ],
  ui: [
    "user interface",
    "desain antarmuka",
    "prototyping",
    "desain aplikasi",
  ],
  ux: [
    "user experience",
    "pengalaman pengguna",
    "riset pengguna",
    "wireframing",
  ],
};

/**
 * Memperluas query pencarian menggunakan Tesaurus Vokasi secara instan (0ms)
 */
export function expandVocationalQuerySync(query: string): {
  expandedQuery: string;
  matchedSynonyms: string[];
} {
  const normalized = query.toLowerCase();
  const matchedSynonyms: string[] = [];

  // Cari kecocokan kata kunci di tesaurus
  for (const [key, synonyms] of Object.entries(VOCATIONAL_THESAURUS)) {
    // Cocokkan apakah key ada di query sebagai kata utuh atau frasa
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(normalized)) {
      for (const syn of synonyms) {
        if (!matchedSynonyms.includes(syn) && !normalized.includes(syn.toLowerCase())) {
          matchedSynonyms.push(syn);
        }
      }
    }
  }

  const additions = matchedSynonyms.slice(0, 8).join(" ");
  const expandedQuery = additions ? `${query} ${additions}` : query;

  return {
    expandedQuery,
    matchedSynonyms: matchedSynonyms.slice(0, 8),
  };
}

/**
 * Intelligent Query Expansion hybrid:
 * 1. Menggunakan Tesaurus Vokasi (instan)
 * 2. Jika ada GEMINI_API_KEY, memperkaya secara kontekstual dengan Gemini Flash
 */
export async function expandVocationalQuery(query: string): Promise<{
  expandedQuery: string;
  matchedSynonyms: string[];
}> {
  const base = expandVocationalQuerySync(query);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || query.trim().length < 3) {
    return base;
  }

  try {
    const prompt = `Kamu adalah pakar kurikulum SMK Kemdikbud dan standar SKKNI Kemnaker.
Berikan 4-6 kata kunci teknis standar SKKNI resmi atau industri yang paling relevan untuk mata pelajaran: "${query}".
Cukup sebutkan istilah-istilahnya saja dipisahkan dengan koma, tanpa kalimat pembuka atau penutup.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 80, temperature: 0.2 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (text) {
        const aiTerms = text
          .split(/[,;\n]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 2 && !base.matchedSynonyms.includes(s));

        const allSynonyms = Array.from(new Set([...base.matchedSynonyms, ...aiTerms])).slice(0, 8);
        return {
          expandedQuery: `${query} ${allSynonyms.join(" ")}`,
          matchedSynonyms: allSynonyms,
        };
      }
    }
  } catch (err) {
    console.warn("Gemini query expansion fallback to static thesaurus:", err);
  }

  return base;
}
