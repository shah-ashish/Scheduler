// src/hooks/useSchedule.js
// All app state lives here. Components only read and call functions.

import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "../lib/storage.js";
import { buildSchedule } from "../lib/ai.js";
import { todayKey, yesterdayKey, blockStatus, nowMins } from "../lib/time.js";
import { DEFAULT_BLOCKS, QUOTES } from "../lib/constants.js";

// Helper to send notifications using Service Worker (required for mobile support)
function sendNotification(title, options) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.showNotification(title, options).catch((err) => {
          console.error("SW showNotification failed, falling back:", err);
          fallbackWindowNotification(title, options);
        });
      })
      .catch((err) => {
        console.error("SW ready failed, falling back:", err);
        fallbackWindowNotification(title, options);
      });
  } else {
    fallbackWindowNotification(title, options);
  }
}

function fallbackWindowNotification(title, options) {
  try {
    new Notification(title, options);
  } catch (e) {
    console.error("Standard Notification constructor failed:", e);
  }
}

export function useSchedule() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [blocks, setBlocksState] = useState(DEFAULT_BLOCKS);
  const [done, setDoneState] = useState([]);
  const [streak, setStreakState] = useState({ count: 0, lastDate: null });
  const [planText, setPlanTextState] = useState("");
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [tick, setTick] = useState(0);

  // Clock tick every 30s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Load from storage on mount
  useEffect(() => {
    setProfile(storage.get("profile"));
    setBlocksState(storage.get("blocks") ?? DEFAULT_BLOCKS);
    setStreakState(storage.get("streak") ?? { count: 0, lastDate: null });
    setPlanTextState(storage.get("planText") ?? "");
    setDoneState(storage.get(`done:${todayKey()}`) ?? []);
    setReady(true);
  }, []);

  // Derived: sorted blocks + statuses
  const current = nowMins();
  const sortedBlocks = [...blocks].sort((a, b) => {
    const [ah, am] = a.start.split(":").map(Number);
    const [bh, bm] = b.start.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  const activeBlock = sortedBlocks.find((b) => blockStatus(b, current) === "active");
  const nextBlock = sortedBlocks.find((b) => blockStatus(b, current) === "upcoming");

  // Persist profile
  const saveProfile = useCallback((p) => {
    setProfile(p);
    storage.set("profile", p);
  }, []);

  // Persist blocks
  const saveBlocks = useCallback((b) => {
    setBlocksState(b);
    storage.set("blocks", b);
  }, []);

  // Toggle a block done
  const toggleDone = useCallback(
    (id) => {
      const key = todayKey();
      const alreadyDone = done.includes(id);
      const next = alreadyDone ? done.filter((x) => x !== id) : [...done, id];
      setDoneState(next);
      storage.set(`done:${key}`, next);

      // Update streak on first completion of the day
      if (!alreadyDone && done.length === 0) {
        const yKey = yesterdayKey();
        let newStreak;
        if (streak.lastDate === yKey) {
          newStreak = { count: streak.count + 1, lastDate: key };
        } else if (streak.lastDate === key) {
          newStreak = streak;
        } else {
          newStreak = { count: 1, lastDate: key };
        }
        setStreakState(newStreak);
        storage.set("streak", newStreak);
      }
    },
    [done, streak]
  );

  // Build schedule from freeform text via AI
  const applyPlanText = useCallback(
    async (text) => {
      const parsed = await buildSchedule(text); // throws on failure
      const cleaned = parsed.map((item, i) => ({
        id: item.id || `task-${i}`,
        type: ["interview", "jobsearch", "reminder"].includes(item.type) ? item.type : "reminder",
        icon: ["book", "briefcase", "sunrise", "target"].includes(item.icon) ? item.icon : "target",
        label: String(item.label || "Task"),
        sub: String(item.sub || ""),
        start: item.start,
        end: item.end,
        topics: Array.isArray(item.topics) ? item.topics : undefined,
        criteria: item.criteria ? String(item.criteria) : undefined,
        note: item.note ? String(item.note) : undefined,
      }));
      saveBlocks(cleaned);
      // Reset done for today
      const key = todayKey();
      setDoneState([]);
      storage.set(`done:${key}`, []);
      // Save plan text
      setPlanTextState(text);
      storage.set("planText", text);
    },
    [saveBlocks]
  );

  // Reset everything
  const resetAll = useCallback(() => {
    setProfile(null);
    setDoneState([]);
    setStreakState({ count: 0, lastDate: null });
    setBlocksState(DEFAULT_BLOCKS);
    setPlanTextState("");
    storage.clear();
  }, []);

  // ─── Notification System ───────────────────────────────────────────────────
  const isFirstRender = useRef(true);
  const lastActiveBlockId = useRef(null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      sendNotification("Alerts Enabled!", {
        body: "You'll now receive alerts when your scheduled tasks start.",
      });
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const currentId = activeBlock?.id || null;

    if (isFirstRender.current) {
      lastActiveBlockId.current = currentId;
      isFirstRender.current = false;
      return;
    }

    if (currentId !== lastActiveBlockId.current) {
      if (activeBlock) {
        sendNotification(`Time for: ${activeBlock.label}`, {
          body: `${activeBlock.start} - ${activeBlock.end}${activeBlock.sub ? ` · ${activeBlock.sub}` : ""}`,
          tag: "active-block-reminder",
        });
      }
      lastActiveBlockId.current = currentId;
    }
  }, [activeBlock, ready]);

  return {
    ready,
    profile,
    saveProfile,
    blocks: sortedBlocks,
    saveBlocks,
    done,
    toggleDone,
    streak,
    activeBlock,
    nextBlock,
    planText,
    applyPlanText,
    quote,
    resetAll,
    tick, // expose so components re-render on clock tick
    notificationPermission,
    requestNotificationPermission,
  };
}
