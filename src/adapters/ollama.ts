// src/adapters/ollama.ts

export type DeepDecision = {
  action: "ALLOW" | "WARN" | "BLOCK";
  confidence: number; // 0..1
  tags: string[];
  reasons: string[];
};

export type DeepInspectInput = {
  text: string;
  fast_flags?: string[];
  sensitivity?: string[];
};

// Lista cerrada de tags (enterprise-grade)
const ALLOWED_TAGS = new Set([
  "otp_request",
  "credential_request",
  "card_or_bank_request",
  "urgency_pressure",
  "suspicious_offer",
  "phishing_account_takeover",
  "benign_security_help",
  "other",
]);

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi4-mini:latest";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 20000);

function systemPrompt() {
  return [
    "You are SSGF Deep Inspector, a security classifier.",
    "Output: EXACTLY ONE single-line JSON object and nothing else.",
    "Decision labels: ALLOW, WARN, BLOCK.",
    "",
    "Hard rules:",
    "- If the message asks for: verification codes / OTP / 2FA codes / passwords / PIN/NIP / tokens -> BLOCK.",
    "- If the message asks for: card numbers / bank account identifiers / CLABE / IBAN / routing / account numbers -> BLOCK.",
    "- If the message shows urgency + financial pressure, suspicious offers, or coercion -> WARN (or BLOCK if it also asks for sensitive data).",
    "- If it is benign security help (e.g., 'how to enable 2FA') -> ALLOW.",
    "",
    "Anti-hallucination:",
    "- Only claim what is explicitly present in the text. Do NOT add items not requested.",
    "",
    "Tags must be chosen ONLY from:",
    "[otp_request, credential_request, card_or_bank_request, urgency_pressure, suspicious_offer, phishing_account_takeover, benign_security_help, other]",
    "",
    "Output format (STRICT):",
    "{\"action\":\"ALLOW|WARN|BLOCK\",\"confidence\":0.0-1.0,\"tags\":[string...],\"reasons\":[string...]}",
    "",
    "No markdown. No code fences. No extra keys. No extra text. If unsure -> WARN.",
  ].join("\n");
}

function userPrompt(input: DeepInspectInput) {
  const payload = {
    text: input.text,
    fast_flags: input.fast_flags ?? [],
    sensitivity: input.sensitivity ?? [],
  };
  return [
    "TEXT_AND_CONTEXT_JSON:",
    JSON.stringify(payload),
    "Return JSON now.",
  ].join("\n");
}

function stripFences(s: string) {
  return s.replace(/```json/gi, "").replace(/```/g, "").trim();
}

// Extrae el primer objeto JSON { ... } de forma robusta
function extractFirstJsonObject(raw: string): string | null {
  const s = stripFences(raw);
  const start = s.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function normalizeTags(tags: any): string[] {
  const arr = Array.isArray(tags) ? tags.map(String) : [];
  const filtered = arr.map(t => t.trim()).filter(t => ALLOWED_TAGS.has(t));
  return filtered.length ? filtered : ["other"];
}

function normalizeReasons(reasons: any): string[] {
  const arr = Array.isArray(reasons) ? reasons.map(String) : [];
  const cleaned = arr.map(r => r.trim()).filter(Boolean);
  return cleaned.length ? cleaned.slice(0, 6) : ["No reason provided."];
}

function validateDecision(obj: any): DeepDecision | null {
  const action = String(obj?.action ?? "").toUpperCase();
  if (action !== "ALLOW" && action !== "WARN" && action !== "BLOCK") return null;

  const confidence = clamp01(Number(obj?.confidence));
  const tags = normalizeTags(obj?.tags);
  const reasons = normalizeReasons(obj?.reasons);

  return { action, confidence, tags, reasons } as DeepDecision;
}

function repairPrompt(badOutput: string) {
  return [
    "Return ONLY valid one-line JSON with exactly these keys:",
    "{\"action\":\"ALLOW|WARN|BLOCK\",\"confidence\":0.0-1.0,\"tags\":[string...],\"reasons\":[string...]}",
    "No markdown. No code fences. No extra keys. No extra text.",
    "Tags must be chosen ONLY from:",
    "[otp_request, credential_request, card_or_bank_request, urgency_pressure, suspicious_offer, phishing_account_takeover, benign_security_help, other]",
    "",
    "BAD_OUTPUT:",
    stripFences(badOutput),
    "",
    "Return JSON now.",
  ].join("\n");
}

async function callOllama(payloadPrompt: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: systemPrompt(),
        prompt: payloadPrompt,
        stream: false,
        format: "json",
        keep_alive: "10m",
        options: {
          temperature: 0,
          num_predict: 256,
          top_p: 0.9,
          repeat_penalty: 1.1,
          seed: 0,
        },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Ollama HTTP ${resp.status}: ${txt}`);
    }

    const data: any = await resp.json();
    const out = data?.response;

    if (typeof out === "string") return out.trim();
    return JSON.stringify(out ?? {}).trim();
  } finally {
    clearTimeout(t);
  }
}

/**
 * Deep inspection vía Ollama.
 * - 1 intento normal
 * - si falla parse/validación, 1 retry de "repair"
 * - si falla, fallback seguro: WARN
 */
export async function deepInspectOllama(input: DeepInspectInput): Promise<DeepDecision> {
  const raw1 = await callOllama(userPrompt(input));

  // Con format:"json", normalmente raw1 ya es JSON puro
  try {
    const obj1 = JSON.parse(raw1);
    const ok1 = validateDecision(obj1);
    if (ok1) return ok1;
  } catch {
    // ignore, fallback a extractor
  }

  const json1 = extractFirstJsonObject(raw1);
  if (json1) {
    try {
      const obj1b = JSON.parse(json1);
      const ok1b = validateDecision(obj1b);
      if (ok1b) return ok1b;
    } catch {
      // ignore
    }
  }

  // retry de reparación
  const raw2 = await callOllama(repairPrompt(raw1));
  const json2 = extractFirstJsonObject(raw2) ?? raw2;

  try {
    const obj2 = JSON.parse(json2);
    const ok2 = validateDecision(obj2);
    if (ok2) return ok2;
  } catch {
    // ignore
  }

  return {
    action: "WARN",
    confidence: 0.5,
    tags: ["other"],
    reasons: ["Model output malformed; defaulting to WARN."],
  };
}
