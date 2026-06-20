// src/hooks/useDetail.js
// Handles loading interview questions and job listings for the detail modal.

import { useState, useCallback } from "react";
import { storage } from "../lib/storage.js";
import { generateInterviewQuestions, searchJobs } from "../lib/ai.js";
import { todayKey } from "../lib/time.js";

export function useDetail() {
  const [block, setBlock] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cacheKey = (b) => `detail:${b.id}:${todayKey()}`;

  const load = useCallback(async (b) => {
    setBlock(b);
    setContent(null);
    setError("");

    if (b.type === "reminder") return; // no AI needed

    // Check cache
    const cached = storage.get(cacheKey(b));
    if (cached) {
      setContent(cached);
      return;
    }

    setLoading(true);
    try {
      let data;
      if (b.type === "interview") {
        data = await generateInterviewQuestions(b.topics ?? []);
      } else if (b.type === "jobsearch") {
        data = await searchJobs(b.criteria ?? "");
      }
      setContent(data);
      storage.set(cacheKey(b), data);
    } catch (e) {
      setError(e.message || "Couldn't load content — check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(async () => {
    if (!block || block.type === "reminder") return;
    storage.remove(cacheKey(block));
    setContent(null);
    setError("");
    setLoading(true);
    try {
      let data;
      if (block.type === "interview") {
        data = await generateInterviewQuestions(block.topics ?? []);
      } else if (block.type === "jobsearch") {
        data = await searchJobs(block.criteria ?? "");
      }
      setContent(data);
      storage.set(cacheKey(block), data);
    } catch (e) {
      setError(e.message || "Couldn't regenerate — try again.");
    } finally {
      setLoading(false);
    }
  }, [block]);

  const close = useCallback(() => {
    setBlock(null);
    setContent(null);
    setError("");
    setLoading(false);
  }, []);

  return { block, content, loading, error, open: load, regenerate, close };
}
