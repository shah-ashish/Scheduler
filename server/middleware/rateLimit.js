// server/middleware/rateLimit.js
// Upstash Redis sliding-window rate limiter.
//
// Limits are configurable via .env:
//   RATE_LIMIT_PER_MINUTE=10   → max requests per IP per minute
//   RATE_LIMIT_PER_DAY=100     → max requests per IP per day
//
// Falls back to in-memory counters if Upstash is not configured (safe for local dev).

// ─── Read limits from env (with sane defaults) ────────────────────────────────
const PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? "10",  10);
const PER_DAY    = parseInt(process.env.RATE_LIMIT_PER_DAY    ?? "100", 10);

console.log(`  Rate limits → ${PER_MINUTE} req/min, ${PER_DAY} req/day (per IP)`);

// ─── In-memory fallback store ─────────────────────────────────────────────────
// Used when Upstash env vars are not set (local dev without Redis).
const inMemory = new Map(); // ip → { minuteCount, minuteReset, dayCount, dayReset }

function inMemoryCheck(ip) {
  const now = Date.now();
  const b = inMemory.get(ip) ?? {
    minuteCount: 0, minuteReset: now + 60_000,
    dayCount:    0, dayReset:    now + 86_400_000,
  };

  if (now > b.minuteReset) { b.minuteCount = 0; b.minuteReset = now + 60_000; }
  if (now > b.dayReset)    { b.dayCount    = 0; b.dayReset    = now + 86_400_000; }

  b.minuteCount++;
  b.dayCount++;
  inMemory.set(ip, b);

  if (b.minuteCount > PER_MINUTE) {
    return { blocked: true, reason: `Too many requests — wait a minute and try again. (limit: ${PER_MINUTE}/min)` };
  }
  if (b.dayCount > PER_DAY) {
    return { blocked: true, reason: `Daily limit reached. Come back tomorrow. (limit: ${PER_DAY}/day)` };
  }
  return { blocked: false };
}

// ─── Upstash Redis pipeline helper ────────────────────────────────────────────
async function redisCommand(commands) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // not configured → use in-memory

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) {
      console.warn("  Upstash error:", res.status, await res.text());
      return null; // fail open — don't block the user if Redis is down
    }
    return res.json();
  } catch (err) {
    console.warn("  Upstash unreachable:", err.message);
    return null; // fail open
  }
}

// ─── Express middleware ───────────────────────────────────────────────────────
export async function rateLimit(req, res, next) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const now       = Math.floor(Date.now() / 1000);
  const minuteKey = `rl:min:${ip}:${Math.floor(now / 60)}`;
  const dayKey    = `rl:day:${ip}:${Math.floor(now / 86400)}`;

  const result = await redisCommand([
    ["INCR",   minuteKey],
    ["EXPIRE", minuteKey, 60],      // auto-expires after 1 minute
    ["INCR",   dayKey],
    ["EXPIRE", dayKey,    86400],   // auto-expires after 24 hours
  ]);

  if (result) {
    // ── Upstash responded → use Redis counters ──────────────────────────────
    const perMinute = result[0]?.result ?? 0;
    const perDay    = result[2]?.result ?? 0;

    if (perMinute > PER_MINUTE) {
      return res.status(429).json({
        error: `Too many requests — wait a minute and try again. (limit: ${PER_MINUTE}/min)`,
      });
    }
    if (perDay > PER_DAY) {
      return res.status(429).json({
        error: `Daily limit reached. Come back tomorrow. (limit: ${PER_DAY}/day)`,
      });
    }
  } else {
    // ── No Upstash → fall back to in-memory ────────────────────────────────
    const check = inMemoryCheck(ip);
    if (check.blocked) {
      return res.status(429).json({ error: check.reason });
    }
  }

  next();
}
