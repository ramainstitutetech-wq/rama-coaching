export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// ─── Technical terms that should NOT be translated ────────────────────────────
// These are preserved as-is in Hindi output (context-aware, not blind replace)
const PRESERVE_TERMS = new Set([
  // Computer Hardware
  "cpu", "gpu", "ram", "rom", "hdd", "ssd", "usb", "hdmi", "vga", "bios",
  "uefi", "motherboard", "processor", "cache", "register",
  // Networking
  "ip", "tcp", "udp", "dns", "http", "https", "ftp", "smtp", "pop3", "imap",
  "lan", "wan", "vpn", "mac", "router", "modem", "firewall", "bandwidth",
  "protocol", "packet", "server", "client",
  // Programming / Software
  "html", "css", "javascript", "js", "python", "java", "c++", "php", "sql",
  "api", "url", "json", "xml", "rest", "soap", "git", "github", "linux",
  "windows", "android", "ios", "app", "software", "hardware", "database",
  "mysql", "mongodb", "firebase", "cloud", "aws", "azure",
  // Office / General Tech
  "ms", "microsoft", "excel", "word", "powerpoint", "pdf", "jpeg", "png",
  "mp3", "mp4", "wifi", "bluetooth", "email", "password", "username",
  "internet", "browser", "chrome", "firefox", "website", "search",
  // Science terms
  "dna", "rna", "atp", "ph", "co2", "h2o", "o2", "co", "hz", "khz", "mhz",
  "ghz", "kb", "mb", "gb", "tb", "bit", "byte",
  // Numbers and units — kept as English naturally
]);

// Regex to find preserve-terms surrounded by word boundaries (case-insensitive)
const PRESERVE_REGEX = new RegExp(
  `\\b(${[...PRESERVE_TERMS]
    .sort((a, b) => b.length - a.length) // longer matches first
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`,
  "gi"
);

// ─── Placeholder encode/decode to protect preserved terms during translation ──
function encodeTechTerms(text: string): { encoded: string; map: Map<string, string> } {
  const map = new Map<string, string>();
  let idx = 0;
  const encoded = text.replace(PRESERVE_REGEX, (match) => {
    const placeholder = `__T${idx++}__`;
    map.set(placeholder, match); // preserve original casing
    return placeholder;
  });
  return { encoded, map };
}

function decodeTechTerms(text: string, map: Map<string, string>): string {
  let result = text;
  for (const [placeholder, original] of map.entries()) {
    result = result.replaceAll(placeholder, original);
  }
  return result;
}

// ─── MyMemory translation (free, no API key, 5000 req/day) ───────────────────
async function translateViaMyMemory(text: string): Promise<string> {
  if (!text.trim()) return "";

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
  const res = await fetch(url, {
    headers: { "User-Agent": "RamaCoachingCenter/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);

  const data = await res.json();

  // MyMemory returns status 200 with responseStatus inside
  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory error: ${data.responseMessage}`);
  }

  let translated: string = data.responseData?.translatedText ?? "";

  // If MyMemory returns the same text or empty, the translation failed
  if (!translated || translated.toLowerCase() === text.toLowerCase()) {
    throw new Error("Translation not available");
  }

  return translated.trim();
}

// ─── Translate a single string with tech-term protection ─────────────────────
async function translateSafe(text: string): Promise<{ translated: string; error?: string }> {
  if (!text.trim()) return { translated: "" };

  try {
    const { encoded, map } = encodeTechTerms(text);
    const raw = await translateViaMyMemory(encoded);
    const final = decodeTechTerms(raw, map);
    return { translated: final };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Translation failed";
    return { translated: text, error: msg }; // fallback: return original
  }
}

// ─── POST /api/translate ──────────────────────────────────────────────────────
// Body: { texts: string[] }   — array of strings to translate (max 10)
// Returns: { results: Array<{ original, translated, error? }> }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const texts: string[] = Array.isArray(body.texts) ? body.texts.slice(0, 10) : [];

    if (texts.length === 0) {
      return NextResponse.json(
        { success: false, error: "texts array is required" },
        { status: 400 }
      );
    }

    // Translate all texts — stagger requests slightly to avoid rate-limit
    const results = await Promise.all(
      texts.map(async (text, i) => {
        // 150ms delay between requests to be polite to free API
        if (i > 0) await new Promise((r) => setTimeout(r, i * 150));
        const { translated, error } = await translateSafe(text);
        return { original: text, translated, ...(error ? { error } : {}) };
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[POST /api/translate]", err);
    return NextResponse.json(
      { success: false, error: "Translation service unavailable" },
      { status: 500 }
    );
  }
}
