// src/server.ts
import express from "express";
import { inspectHandler } from "./routes/inspect";
import { health, healthOllama } from "./routes/health";
import { warmupOllama } from "./warmup";
import { rateLimit } from "./middleware/rateLimit";

const app = express();
app.use(express.json({ limit: "1mb" }));

// rate limit global (puedes aplicar solo en /inspect si prefieres)
app.use(rateLimit);

app.get("/health", health);
app.get("/health/ollama", healthOllama);

app.post("/inspect", inspectHandler);

const PORT = Number(process.env.PORT || 8080);

app.listen(PORT, () => {
  console.log(`SSGF listening on port ${PORT}`);
  // warmup no bloqueante
  warmupOllama();
});
