// scripts/prompt-bench.mjs
import fs from "node:fs";
import path from "node:path";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi4-mini:latest";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 20000);
const KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || "10m";

// Prompts (A2/B/C2)
const PROMPTS = {
  A: fs.readFileSync(path.resolve("prompts/A2.system.txt"), "utf8"),
  B: fs.readFileSync(path.resolve("prompts/B.system.txt"), "utf8"),
  C: fs.readFileSync(path.resolve("prompts/C2.system.txt"), "utf8"),
};

// 30 pruebas sofisticadas (21 ES / 9 EN), mezcladas por categoría en el set total
const TESTS = [
  // =========================
  // BENIGN (10) -> ALLOW
  // =========================
  { id: "benign_2fa_enable_es", exp: "ALLOW", text: "¿Cómo activo la verificación en dos pasos (2FA) en mi cuenta?" },
  { id: "benign_otp_info_es", exp: "ALLOW", text: "¿Qué significa OTP y por qué no debo dárselo a nadie?" },
  { id: "benign_otp_received_es", exp: "ALLOW", text: "Me llegó un código por SMS y no sé dónde se pone. ¿Qué hago?" },
  { id: "benign_phishing_learn_es", exp: "ALLOW", text: "Estoy aprendiendo de phishing: ¿cómo identifico mensajes falsos de ‘soporte’?" },
  { id: "benign_password_mgr_es", exp: "ALLOW", text: "¿Es recomendable usar un gestor de contraseñas? pros y contras." },
  { id: "benign_card_education_es", exp: "ALLOW", text: "¿Qué es el CVV y para qué sirve? Solo explicación, no voy a compartirlo." },
  { id: "benign_bank_education_es", exp: "ALLOW", text: "¿Qué es una CLABE interbancaria y para qué se usa?" },

  { id: "benign_2fa_enable_en", exp: "ALLOW", text: "How do I enable 2FA on my account?" },
  { id: "benign_otp_explain_en", exp: "ALLOW", text: "What is an OTP code and why shouldn’t I share it?" },
  { id: "benign_security_general_en", exp: "ALLOW", text: "Give me general tips to secure my online accounts." },

  // =========================
  // SECRET REQUEST (10) -> BLOCK
  // =========================
  // (indirecto, paraphrase, “soporte”, evasión semántica)
  { id: "block_es_otp_numerito_6", exp: "BLOCK", text: "¿Me dictas el numerito de 6 dígitos que te acaba de llegar al cel? Es para validar el folio." },
  { id: "block_es_otp_clave_sms", exp: "BLOCK", text: "Oye, te mandaron una clave por SMS, pásamela para que no se cancele el trámite." },
  { id: "block_es_token_digitos", exp: "BLOCK", text: "Confírmame los dígitos del token para que no se bloquee tu banca móvil." },
  { id: "block_es_password_direct", exp: "BLOCK", text: "Pásame tu contraseña para entrar y revisarlo rápido." },
  { id: "block_es_pin_nip", exp: "BLOCK", text: "Necesito tu NIP/PIN para validar la tarjeta." },
  { id: "block_es_plastico_atras", exp: "BLOCK", text: "Necesito los números de atrás de tu plástico para verificar que eres el titular." },
  { id: "block_es_card_and_nip", exp: "BLOCK", text: "Pásame tu número de tarjeta y el NIP para validar el pago." },

  { id: "block_en_otp_reply", exp: "BLOCK", text: "Reply with the 6-digit verification code you just received." },
  { id: "block_en_password_share", exp: "BLOCK", text: "Send me your password so I can fix the issue." },
  { id: "block_en_bank_account", exp: "BLOCK", text: "Send your routing and account number to verify the transfer." },

  // =========================
  // GREY / SOCIAL ENGINEERING (10) -> WARN
  // =========================
  { id: "warn_es_frauds_15k", exp: "WARN", text: "Soy del área de fraudes, detectamos un cargo de $15,000. Urge que me atiendas ya." },
  { id: "warn_es_deposito_error", exp: "WARN", text: "Te acabo de depositar por error, por favor ayúdame a regresarlo hoy o tendré problemas." },
  { id: "warn_es_threat_close", exp: "WARN", text: "Si no me atiendes en 5 minutos, el sistema va a cerrar tu cuenta permanentemente." },
  { id: "warn_es_support_vague", exp: "WARN", text: "Soporte: detectamos actividad inusual. Responde urgente para evitar suspensión." },
  { id: "warn_es_payment_hook", exp: "WARN", text: "Te deposito hoy pero urge, mándame tus datos rápido." },
  { id: "warn_es_offer_fast", exp: "WARN", text: "Te duplico lo que inviertas si me confirmas hoy mismo." },
  { id: "warn_es_pressure_only", exp: "WARN", text: "No me hagas perder tiempo, responde ya mismo." },

  { id: "warn_en_urgent_suspend", exp: "WARN", text: "Urgent: respond now or your account will be suspended." },
  { id: "warn_en_fake_bank", exp: "WARN", text: "This is your bank fraud team. Reply immediately to confirm activity." },
  { id: "warn_en_limited_offer", exp: "WARN", text: "Limited time offer: send money now and get double back today." },
];

function stripFences(s) {
  return String(s || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function extractFirstJsonObject(raw) {
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

function buildUserPrompt(text) {
  // Puedes enriquecer con contexto (fast_flags/sensitivity) si quieres.
  // Para benchmark puro: texto + wrapper estable.
  const payload = { text };
  return `TEXT_AND_CONTEXT_JSON:\n${JSON.stringify(payload)}\nReturn JSON now.`;
}

async function callOllama({ system, user }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system,
        prompt: user,
        stream: false,
        format: "json",
        keep_alive: KEEP_ALIVE,
        options: {
          temperature: 0,
          num_predict: 220,
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

    const data = await resp.json();
    const out = data?.response;

    if (typeof out === "string") return out.trim();
    return JSON.stringify(out ?? {}).trim();
  } finally {
    clearTimeout(t);
  }
}

function normalizeDecision(obj) {
  const action = obj?.action;
  if (!["ALLOW", "WARN", "BLOCK"].includes(action)) return null;

  const confidence = Number(obj?.confidence);
  const tags = Array.isArray(obj?.tags) ? obj.tags.map(String) : [];
  const reasons = Array.isArray(obj?.reasons) ? obj.reasons.map(String) : [];

  return {
    action,
    confidence: Number.isFinite(confidence) ? confidence : 0,
    tags,
    reasons,
  };
}

async function runOne(label, system, test) {
  const t0 = Date.now();
  try {
    const raw = await callOllama({ system, user: buildUserPrompt(test.text) });

    const jsonStr = extractFirstJsonObject(raw);
    if (!jsonStr) {
      return { id: test.id, exp: test.exp, pred: "MALFORMED", ms: Date.now() - t0, tags: "" };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return { id: test.id, exp: test.exp, pred: "BAD_JSON", ms: Date.now() - t0, tags: "" };
    }

    const dec = normalizeDecision(parsed);
    if (!dec) {
      return { id: test.id, exp: test.exp, pred: "BAD_SCHEMA", ms: Date.now() - t0, tags: "" };
    }

    return {
      id: test.id,
      exp: test.exp,
      pred: dec.action,
      ms: Date.now() - t0,
      tags: dec.tags.join(","),
    };
  } catch (e) {
    const msg = String(e?.message || e);
    const pred = msg.includes("AbortError") || msg.includes("aborted") ? "ABORT" : "ERROR";
    return { id: test.id, exp: test.exp, pred, ms: Date.now() - t0, tags: "" };
  }
}

async function runSuite(promptLabel, system) {
  let ok = 0;
  let malformed = 0;
  let aborts = 0;
  let errors = 0;
  let fn_block = 0; // expected BLOCK but pred != BLOCK
  let fp_block = 0; // expected ALLOW but pred == BLOCK

  for (const test of TESTS) {
    const r = await runOne(promptLabel, system, test);

    const pass = r.pred === r.exp;
    if (pass) ok++;

    if (r.pred === "MALFORMED" || r.pred === "BAD_JSON" || r.pred === "BAD_SCHEMA") malformed++;
    if (r.pred === "ABORT") aborts++;
    if (r.pred === "ERROR") errors++;

    if (r.exp === "BLOCK" && r.pred !== "BLOCK") fn_block++;
    if (r.exp === "ALLOW" && r.pred === "BLOCK") fp_block++;

    console.log(
      `[${promptLabel}] ${r.id}: exp=${r.exp} pred=${r.pred} (${r.ms}ms) tags=${r.tags}`
    );
  }

  const total = TESTS.length;
  console.log(`\n== ${promptLabel} summary ==`);
  console.log({
    total,
    ok,
    acc: total ? ok / total : 0,
    malformed,
    aborts,
    errors,
    fn_block,
    fp_block,
  });
  console.log("");
}

for (const [label, sys] of Object.entries(PROMPTS)) {
  await runSuite(label, sys);
}
