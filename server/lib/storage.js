// server/lib/storage.js
// Handles storage of push subscriptions and schedule blocks per deviceId.
// Fits the same architecture as rateLimit: uses Upstash Redis if configured,
// otherwise falls back to in-memory storage (fine for local dev/testing).

const inMemory = new Map(); // deviceId -> { subscription, blocks }

// Upstash REST single-command execution helper
async function redisCommand(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (!res.ok) {
      console.warn("Storage Redis status error:", res.status);
      return null;
    }
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.warn("Storage Redis unreachable:", err.message);
    return null;
  }
}

export async function saveSubscription(deviceId, subscription) {
  const isRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (isRedis) {
    await redisCommand(["SET", `sub:${deviceId}`, JSON.stringify(subscription)]);
    await redisCommand(["SADD", "devices", deviceId]);
  } else {
    const data = inMemory.get(deviceId) || {};
    data.subscription = subscription;
    inMemory.set(deviceId, data);
  }
}

export async function getSubscription(deviceId) {
  const isRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (isRedis) {
    const res = await redisCommand(["GET", `sub:${deviceId}`]);
    return res ? JSON.parse(res) : null;
  } else {
    return inMemory.get(deviceId)?.subscription || null;
  }
}

export async function saveBlocks(deviceId, blocks) {
  const isRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (isRedis) {
    await redisCommand(["SET", `blocks:${deviceId}`, JSON.stringify(blocks)]);
    await redisCommand(["SADD", "devices", deviceId]);
  } else {
    const data = inMemory.get(deviceId) || {};
    data.blocks = blocks;
    inMemory.set(deviceId, data);
  }
}

export async function getBlocks(deviceId) {
  const isRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (isRedis) {
    const res = await redisCommand(["GET", `blocks:${deviceId}`]);
    return res ? JSON.parse(res) : null;
  } else {
    return inMemory.get(deviceId)?.blocks || null;
  }
}

export async function getAllDevices() {
  const isRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (isRedis) {
    const res = await redisCommand(["SMEMBERS", "devices"]);
    return res || [];
  } else {
    return Array.from(inMemory.keys());
  }
}
