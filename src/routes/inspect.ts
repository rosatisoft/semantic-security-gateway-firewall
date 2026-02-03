// src/routes/inspect.ts
import type { Request, Response } from "express";
import { inspectAdaptive } from "../engine/adaptive";

export async function inspectHandler(req: Request, res: Response) {
  const text = String(req.body?.text ?? "");

  const start = Date.now();
  const result = await inspectAdaptive(text);
  const latency = Date.now() - start;

  return res.json({
    ...result,
    latency_ms: latency,
  });
}
