// src/engine/fast.ts
import { gate } from "llm-entropy-filter";
import { detectSensitivity } from "./sensitivity";

export type InspectResult = {
  action: "ALLOW" | "WARN" | "BLOCK";
  entropy_score: number;
  flags: string[];
  layer: "fast" | "deep";
  escalated: boolean;
  escalate_reason?: "warn_band" | "sensitive_trigger" | "deep_queue_full";
  sensitivity?: string[];
  // campos deep (si aplica)
  confidence?: number;
  tags?: string[];
  rationale?: string;
  adapter?: "none" | "ollama";
};

export function inspectFast(text: string): InspectResult {
  const fast = gate(text);
  const sens = detectSensitivity(text);

  // BLOCK siempre regresa inmediato
  if (fast.action === "BLOCK") {
    return {
      action: fast.action,
      entropy_score: fast.entropy_score,
      flags: fast.flags,
      layer: "fast",
      escalated: false,
      sensitivity: sens.triggers,
      adapter: "none",
    };
  }

  // WARN → escalar
  if (fast.action === "WARN") {
    return {
      action: fast.action,
      entropy_score: fast.entropy_score,
      flags: fast.flags,
      layer: "fast",
      escalated: true,
      escalate_reason: "warn_band",
      sensitivity: sens.triggers,
      adapter: "none",
    };
  }

  // ALLOW pero con sensibilidad → escalar
  if (fast.action === "ALLOW" && sens.hit) {
    return {
      action: fast.action,
      entropy_score: fast.entropy_score,
      flags: fast.flags,
      layer: "fast",
      escalated: true,
      escalate_reason: "sensitive_trigger",
      sensitivity: sens.triggers,
      adapter: "none",
    };
  }

  // ALLOW limpio
  return {
    action: fast.action,
    entropy_score: fast.entropy_score,
    flags: fast.flags,
    layer: "fast",
    escalated: false,
    sensitivity: sens.triggers,
    adapter: "none",
  };
}
