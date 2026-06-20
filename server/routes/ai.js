// server/routes/ai.js
// All AI routes — three endpoints via a single POST /api/ai call.
// Request body: { type: string, payload: object }

import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

// ─── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(type, payload) {
  switch (type) {
    case "build_schedule":
      return `You are scheduling a daily routine for someone based on their goals. Convert the plan below into a JSON array of schedule blocks.

Each block must have:
- "id": short kebab-case unique string
- "type": one of "interview" | "jobsearch" | "reminder"
- "icon": one of "book" | "briefcase" | "sunrise" | "target"
- "label": short title (max 4 words)
- "sub": short subtitle (max 6 words)
- "start": "HH:MM" 24-hour
- "end": "HH:MM" 24-hour
- "topics": string[] ONLY if type is "interview"
- "criteria": string ONLY if type is "jobsearch"
- "note": one short actionable sentence ONLY if type is "reminder"

Reply with ONLY the JSON array — no markdown, no preamble, no explanation.

User's plan:
${payload.text}`;

    case "interview_questions": {
      const topics = (payload.topics || ["React", "JavaScript", "CSS"]).join(", ");
      return `Generate exactly 10 realistic technical interview questions for a frontend developer role.
Mix topics from: ${topics}.
Vary difficulty: 3 easy, 4 medium, 3 hard.
No answers. No numbering. No markdown.
Reply with ONLY a JSON array of 10 strings.`;
    }

    case "job_search":
      return `List 5 realistic entry-level remote frontend developer job opportunities.
For each return: title, company name, and a plausible job board URL (LinkedIn, Indeed, Greenhouse, Lever, or company careers page).
Criteria: ${payload.criteria || "entry-level remote React frontend developer"}
Reply with ONLY a JSON array like: [{"title":"","company":"","url":""}]
No markdown, no preamble.`;

    default:
      return null;
  }
}

// ─── POST /api/ai ─────────────────────────────────────────────────────────────
router.post("/", rateLimit, async (req, res) => {
  const { type, payload = {} } = req.body;

  // API key guard
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY is not set in .env" });
  }

  // Build prompt
  const prompt = buildPrompt(type, payload);
  if (!prompt) {
    return res.status(400).json({ error: `Unknown request type: "${type}"` });
  }

  // Call OpenRouter
  try {
    console.log(`  → [${type}] calling OpenRouter...`);

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer":  process.env.APP_URL || "http://localhost:5173",
        "X-Title":       "Focus Control",
      },
      body: JSON.stringify({
        model:       process.env.AI_MODEL || "openai/gpt-4o-mini",
        max_tokens:  1200,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      console.error("  ✖ OpenRouter error:", err);
      return res.status(502).json({ error: "AI provider error", detail: err });
    }

    const data = await aiRes.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    console.log(`  ✔ [${type}] ${text.length} chars received`);
    return res.json({ text });

  } catch (err) {
    console.error("  ✖ Server error:", err.message);
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

export default router;
