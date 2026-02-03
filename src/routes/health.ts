// src/routes/health.ts
import type { Request, Response } from "express";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "phi4-mini:latest";
const TIMEOUT_MS = Number(process.env.OLLAMA_HEALTH_TIMEOUT_MS || 2500);

export async function health(_req: Request, res: Response) {
  return res.json({
    ok: true,
    service: "SSGF",
    adapter: "ollama",
    model: MODEL,
  });
}

export async function healthOllama(_req: Request, res: Response) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });

    const latency = Date.now() - start;

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return res.status(503).json({
        ok: false,
        service: "SSGF",
        adapter: "ollama",
        url: OLLAMA_URL,
        model: MODEL,
        timeout_ms: TIMEOUT_MS,
        latency_ms: latency,
        error: `HTTP ${r.status}: ${txt}`,
      });
    }

    const data: any = await r.json();
    const models = Array.isArray(data?.models)
      ? data.models.map((m: any) => m?.name).filter(Boolean)
      : [];

    return res.json({
      ok: true,
      service: "SSGF",
      adapter: "ollama",
      url: OLLAMA_URL,
      model: MODEL,
      timeout_ms: TIMEOUT_MS,
      latency_ms: latency,
      model_installed: models.includes(MODEL),
      models,
    });
  } catch (e: any) {
    const latency = Date.now() - start;
    return res.status(503).json({
      ok: false,
      service: "SSGF",
      adapter: "ollama",
      url: OLLAMA_URL,
      model: MODEL,
      timeout_ms: TIMEOUT_MS,
      latency_ms: latency,
      error: String(e?.message ?? e),
    });
  } finally {
    clearTimeout(t);
  }
}
