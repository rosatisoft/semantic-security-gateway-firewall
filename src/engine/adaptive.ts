// src/engine/adaptive.ts
import { inspectFast } from "./fast";
import { deepInspectOllama } from "../adapters/ollama";
import { enqueueDeep } from "./deepQueue";

const FINANCIAL_HINTS = [
  "deposito",
  "transferencia",
  "pago",
  "dinero",
  "efectivo"
];

function hasFinancialHint(text: string): boolean {
  const t = text.toLowerCase();
  return FINANCIAL_HINTS.some(w => t.includes(w));
}

export async function inspectAdaptive(text: string) {
  const fast = inspectFast(text);

  // 1️⃣ BLOCK inmediato
  if (fast.action === "BLOCK") {
    return {
      ...fast,
      adapter: "none"
    };
  }

  // 2️⃣ Escalamiento por WARN band
  if (fast.escalated) {
    const deep = await enqueueDeep(() =>
      deepInspectOllama({
        text,
        fast_flags: fast.flags,
        sensitivity: fast.sensitivity
      })
    );

    return {
      ...fast,
      ...deep,
      layer: "deep",
      adapter: "ollama"
    };
  }

  // 3️⃣ Escalar urgencia + financiero
  if (fast.flags.includes("urgency") && hasFinancialHint(text)) {
    const deep = await enqueueDeep(() =>
      deepInspectOllama({
        text,
        fast_flags: fast.flags,
        sensitivity: fast.sensitivity
      })
    );

    return {
      ...fast,
      ...deep,
      layer: "deep",
      escalated: true,
      escalate_reason: "warn_band",
      adapter: "ollama"
    };
  }

  // 4️⃣ ALLOW puro
  return {
    ...fast,
    adapter: "none"
  };
}
