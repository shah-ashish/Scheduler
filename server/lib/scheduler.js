// server/lib/scheduler.js
// Background task runner that checks schedule times every 30 seconds
// and pushes notifications to devices.

import webpush from "web-push";
import { getSubscription, getBlocks, getAllDevices } from "./storage.js";

export function startScheduler() {
  // Keeps track of the last block we sent a notification for to prevent duplicates.
  // Format: deviceId -> "blockId:HH:MM"
  const lastNotified = new Map();

  setInterval(async () => {
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      const devices = await getAllDevices();
      
      for (const deviceId of devices) {
        const blocks = await getBlocks(deviceId);
        if (!blocks || !Array.isArray(blocks)) continue;

        // Find any block starting at this exact minute
        const startingBlock = blocks.find((b) => b.start === timeStr);
        if (!startingBlock) continue;

        // Check if we already notified this device for this block in the current minute
        const cacheKey = `${startingBlock.id}:${timeStr}`;
        if (lastNotified.get(deviceId) === cacheKey) continue;

        const subscription = await getSubscription(deviceId);
        if (!subscription) continue;

        // Mark as notified immediately
        lastNotified.set(deviceId, cacheKey);

        const payload = JSON.stringify({
          title: `Time for: ${startingBlock.label}`,
          body: `${startingBlock.start} - ${startingBlock.end}${
            startingBlock.sub ? ` · ${startingBlock.sub}` : ""
          }`,
          tag: "active-block-reminder",
        });

        console.log(`[Scheduler] Sending push to ${deviceId}: "${startingBlock.label}"`);
        
        webpush.sendNotification(subscription, payload).catch((err) => {
          console.error(
            `[Scheduler] Push failed for ${deviceId}:`,
            err.statusCode,
            err.message
          );
        });
      }
    } catch (err) {
      console.error("[Scheduler] Error in check loop:", err);
    }
  }, 30_000);

  console.log("⏰ Background notification scheduler started (polling every 30s).");
}
