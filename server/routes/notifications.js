// server/routes/notifications.js
import { Router } from "express";
import webpush from "web-push";
import { saveSubscription, saveBlocks } from "../lib/storage.js";

const router = Router();

// VAPID keys setup
let vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// Generate keys dynamically if not configured in .env (for zero-config local development)
if (!vapidPublicKey || !vapidPrivateKey) {
  const keys = webpush.generateVAPIDKeys();
  vapidPublicKey = keys.publicKey;
  vapidPrivateKey = keys.privateKey;
  console.log(`
  ⚠️  VAPID keys not configured in server/.env.
      Generated temporary session VAPID keys:
      
      VAPID_PUBLIC_KEY=${vapidPublicKey}
      VAPID_PRIVATE_KEY=${vapidPrivateKey}
      
      (Add these to server/.env to persist subscriptions across server restarts)
  `);
}

// Configure web-push with details
webpush.setVapidDetails(
  "mailto:contact@focuscontrol.local", // placeholder contact email
  vapidPublicKey,
  vapidPrivateKey
);

// GET /api/notifications/vapid-key
router.get("/vapid-key", (req, res) => {
  res.json({ publicKey: vapidPublicKey });
});

// POST /api/notifications/subscribe
router.post("/subscribe", async (req, res) => {
  const { deviceId, subscription } = req.body;
  if (!deviceId || !subscription) {
    return res.status(400).json({ error: "deviceId and subscription are required" });
  }

  try {
    await saveSubscription(deviceId, subscription);
    res.json({ success: true, message: "Subscription saved successfully" });
  } catch (err) {
    console.error("Error saving subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

// POST /api/notifications/schedule
router.post("/schedule", async (req, res) => {
  const { deviceId, blocks } = req.body;
  if (!deviceId || !Array.isArray(blocks)) {
    return res.status(400).json({ error: "deviceId and blocks array are required" });
  }

  try {
    await saveBlocks(deviceId, blocks);
    res.json({ success: true, message: "Schedule synced successfully" });
  } catch (err) {
    console.error("Error syncing schedule:", err);
    res.status(500).json({ error: "Failed to sync schedule" });
  }
});

export default router;
