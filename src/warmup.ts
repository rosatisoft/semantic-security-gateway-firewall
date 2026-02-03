// src/warmup.ts
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "phi4-mini:latest";

export async function warmupOllama() {
  try {
    // warmup pequeño y barato: 1 token
    await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: '{"action":"ALLOW","confidence":1,"tags":["other"],"reasons":["warmup"]}',
        stream: false,
        keep_alive: "10m",
        options: { temperature: 0, num_predict: 16 },
      }),
    }).catch(() => {});
  } catch {
    // no hacemos nada: warmup no debe tumbar server
  }
}
