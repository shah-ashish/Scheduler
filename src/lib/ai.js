// src/lib/ai.js
// All AI calls go through the Express server proxy.
// Configure the endpoint via VITE_API_URL in the root .env file.

const ENDPOINT = import.meta.env.VITE_API_URL ?? "/api/ai";

async function callAI(type, payload = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.text ?? "";
}

function extractJSON(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/```json|```/gi, "").trim();
  // Find first [ or {
  const arrIdx = cleaned.indexOf("[");
  const objIdx = cleaned.indexOf("{");
  let start =
    arrIdx === -1
      ? objIdx
      : objIdx === -1
      ? arrIdx
      : Math.min(arrIdx, objIdx);
  if (start === -1) throw new Error("No JSON found in response");
  return JSON.parse(cleaned.slice(start));
}

// Build a daily schedule from freeform text
export async function buildSchedule(text) {
  const raw = await callAI("build_schedule", { text });
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Schedule came back empty — try being more specific about times.");
  }
  return parsed;
}

// Generate 10 interview questions for given topics
export async function generateInterviewQuestions(topics = []) {
  const raw = await callAI("interview_questions", { topics });
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) throw new Error("Bad response format");
  return parsed.slice(0, 10);
}

// Get job listings for given criteria
export async function searchJobs(criteria = "") {
  const raw = await callAI("job_search", { criteria });
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) throw new Error("Bad response format");
  return parsed;
}
