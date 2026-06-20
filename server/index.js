// server/index.js
// Express API server for Focus Control.
// Handles all AI calls server-side — keeps API keys out of the browser.
//
// Start with: npm run server
// Then in another terminal: npm run dev

import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import aiRouter from "./routes/ai.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, ".env"), "utf-8");
    let loaded = 0;
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !(key in process.env)) {
        process.env[key] = val;
        loaded++;
      }
    }
    console.log(`✅  Loaded .env (${loaded} vars)`);
  } catch {
    console.warn("⚠️  No .env file found — using process environment only.");
  }
}
loadEnv();

// ─── App setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.SERVER_PORT || 3001;

// Allowed origins — read from CORS_ORIGINS env var (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/ai", aiRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    model:  process.env.AI_MODEL || "openai/gpt-4o-mini",
    upstash: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  });
});

// 404 for unknown API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const perMin  = process.env.RATE_LIMIT_PER_MINUTE ?? "10";
  const perDay  = process.env.RATE_LIMIT_PER_DAY    ?? "100";
  const origins = allowedOrigins.join(", ");
  console.log(`
  ┌─────────────────────────────────────────────────┐
  │  🚀  Focus Control API Server                   │
  │                                                 │
  │  URL:      http://localhost:${PORT}              │
  │  Health:   http://localhost:${PORT}/api/health   │
  │  Model:    ${(process.env.AI_MODEL || "openai/gpt-4o-mini").padEnd(34)}│
  │  Upstash:  ${(process.env.UPSTASH_REDIS_REST_URL ? "✅  connected" : "⚠️   not configured (in-memory)").padEnd(34)}│
  │  Limits:   ${`${perMin} req/min  ·  ${perDay} req/day`.padEnd(34)}│
  │  CORS:     ${origins.padEnd(34)}│
  └─────────────────────────────────────────────────┘

  Run the UI in another terminal:  npm run dev
  Then open:                       http://localhost:5173
  `);
});
