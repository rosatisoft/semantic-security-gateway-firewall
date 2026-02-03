// src/middleware/rateLimit.ts
import type { Request, Response, NextFunction } from "express";

type Bucket = { tokens: number; last: number };

const WINDOW_MS = Number(process.env.RL_WINDOW_MS || 60_000);   // 60s
const MAX_TOKENS = Number(process.env.RL_MAX || 120);          // 120 req/min por IP (ajústalo)
const buckets = new Map<string, Bucket>();

function getClientIp(req: Request) {
  // si luego pones reverse proxy, activa `app.set("trust proxy", 1)`
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();

  let b = buckets.get(ip);
  if (!b) {
    b = { tokens: MAX_TOKENS, last: now };
    buckets.set(ip, b);
  }

  // refill lineal
  const elapsed = now - b.last;
  if (elapsed > 0) {
    const refill = (elapsed / WINDOW_MS) * MAX_TOKENS;
    b.tokens = Math.min(MAX_TOKENS, b.tokens + refill);
    b.last = now;
  }

  if (b.tokens < 1) {
    const retry_after = Math.ceil(WINDOW_MS / 1000);
    res.setHeader("Retry-After", String(retry_after));
    return res.status(429).json({
      ok: false,
      error: "rate_limited",
      retry_after_s: retry_after,
    });
  }

  b.tokens -= 1;
  return next();
}

// Limpieza opcional (para no crecer infinito)
setInterval(() => {
  const now = Date.now();
  for (const [ip, b] of buckets.entries()) {
    if (now - b.last > 10 * WINDOW_MS) buckets.delete(ip);
  }
}, 5 * WINDOW_MS).unref();
