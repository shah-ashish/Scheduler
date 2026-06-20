# ⚡ Focus Control

> **Stop deciding. Start doing.**  
> An AI-powered daily schedule tracker for job-seekers — built with React, Vite, Netlify Functions, and OpenRouter.

---

## 📸 What It Does

Focus Control turns your rough daily plan written in plain English into a live, time-aware schedule. It generates fresh interview questions, surfaces job listings, and keeps a streak counter to keep you consistent — all in a minimal dark-mode UI optimized for mobile.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗓 **AI Schedule Builder** | Type your day in plain words → AI converts it into timed blocks |
| 🎯 **Live Block Tracker** | Highlights the current active block with a countdown timer |
| 💬 **Interview Prep** | Generates 10 fresh technical questions per session (React, JS, CSS, etc.) |
| 💼 **Job Search** | Surfaces entry-level remote frontend listings from the AI |
| 🔥 **Streak Counter** | Tracks consecutive days of completing at least one block |
| ✏️ **Manual Time Editor** | Tweak block labels and start/end times without re-running AI |
| 💾 **Offline Persistence** | All data stored in localStorage — works without a server after first load |
| 🚦 **Rate Limiting** | Server-side per-IP limits via Upstash Redis (10/min, 100/day) |

---

## 🗂 Project Structure

```
focus-control/
│
├── index.html                  ← HTML shell (mounts #root, SVG favicon)
├── vite.config.js              ← Vite + React plugin config
├── netlify.toml                ← Build settings + /api/* → function proxy
├── package.json
│
├── netlify/
│   └── functions/
│       └── ai.js               ← Serverless AI proxy (OpenRouter + rate limit)
│
└── src/
    ├── main.jsx                ← React root render entry point
    ├── App.jsx                 ← App shell, routing between states, modal control
    │
    ├── hooks/
    │   ├── useSchedule.js      ← ALL app state: blocks, done, streak, plan, clock
    │   └── useDetail.js        ← AI content loading + caching for the detail modal
    │
    ├── lib/
    │   ├── ai.js               ← Browser AI client (proxies to /api/ai only)
    │   ├── storage.js          ← localStorage wrapper (prefix: "fc:")
    │   ├── time.js             ← Pure time utilities (format, status, keys)
    │   └── constants.js        ← Default blocks, motivational quotes, icon names
    │
    ├── components/
    │   ├── Onboarding.jsx      ← First-run name capture screen
    │   ├── HeroCard.jsx        ← Live clock + active/next block card
    │   ├── BlockList.jsx       ← Scrollable schedule list with status colors
    │   ├── DetailModal.jsx     ← Bottom-sheet: questions / job listings / reminder
    │   ├── PlanModal.jsx       ← Bottom-sheet: freeform plan → AI schedule
    │   └── EditModal.jsx       ← Bottom-sheet: manual label/time editor
    │
    └── styles/
        └── global.css          ← CSS variables, resets, typography, animations
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                             │
│   main.jsx                                                  │
│      └── App.jsx                                            │
│            ├── useSchedule()  ◄── All schedule state        │
│            │      ├── lib/storage.js  (localStorage)        │
│            │      ├── lib/ai.js       (POST /api/ai)        │
│            │      ├── lib/time.js     (pure helpers)        │
│            │      └── lib/constants.js (defaults)           │
│            │                                                │
│            ├── useDetail()    ◄── Modal AI content + cache  │
│            │                                                │
│            └── Components (read-only, call hook functions)  │
│                 Onboarding → HeroCard → BlockList           │
│                 DetailModal / PlanModal / EditModal          │
└──────────────────────────┬──────────────────────────────────┘
                           │  POST /api/ai
                           │  { type, payload }
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Netlify Function  (netlify/functions/ai.js)     │
│                                                             │
│  1. Method guard (POST only)                                │
│  2. Rate limit check  ──────────► Upstash Redis             │
│       • 10 req / minute / IP                                │
│       • 100 req / day   / IP                                │
│  3. API key guard (OPENROUTER_API_KEY env var)              │
│  4. Build prompt based on { type }                          │
│  5. Call OpenRouter ───────────► LLM (gpt-oss-120b:free)   │
│  6. Return { text } to browser                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Flow 1 — AI Schedule Generation

```
User types plan in PlanModal
        │
        ▼
onApply(text)
        │
        ▼
useSchedule.applyPlanText(text)
        │
        ▼
lib/ai.js → buildSchedule(text)
        │
        ▼
POST /api/ai  { type: "build_schedule", payload: { text } }
        │
        ▼
Netlify Function → OpenRouter → JSON array of blocks
        │
        ▼
Validate + sanitize block fields (type, icon, label, times)
        │
        ▼
saveBlocks(cleaned)  +  reset done[]  +  save planText
        │
        ▼
React re-renders → new schedule displayed
```

---

### Flow 2 — Detail Modal (Interview / Jobs)

```
User taps a block row / HeroCard
        │
        ▼
useDetail.load(block)
        │
        ├── type === "reminder" ──► show block.note (no AI needed)
        │
        └── type === "interview" or "jobsearch"
                │
                ▼
        Check localStorage cache
        key: "detail:<blockId>:<YYYY-MM-DD>"
                │
         ┌──────┴───────┐
       HIT              MISS
         │                │
         ▼                ▼
    setContent(cached)   setLoading(true)
                          │
                          ▼
                 POST /api/ai
                 { type: "interview_questions" | "job_search" }
                          │
                          ▼
                 parse JSON → setContent
                 cache in localStorage
                          │
                          ▼
                 setLoading(false)
```

---

### Flow 3 — Streak Tracking

```
User toggles a block done
        │
        ▼
done.length === 0 before this toggle?
        │
        ├── NO  → update done[] only
        │
        └── YES → this is first completion of the day
                        │
                        ▼
                  streak.lastDate === yesterdayKey?
                        │
                  ┌─────┴──────┐
                 YES            NO
                  │              │
                  ▼              ▼
           count + 1          count = 1
           lastDate = today   lastDate = today
                  │
                  ▼
           persist to localStorage
```

---

## 🧠 State Map (`useSchedule`)

| State | Type | Stored Key | Reset On |
|-------|------|------------|----------|
| `profile` | `{name}` | `fc:profile` | `resetAll()` |
| `blocks` | `Block[]` | `fc:blocks` | `applyPlanText()` / `resetAll()` |
| `done` | `string[]` | `fc:done:YYYY-MM-DD` | midnight (new day key) / `applyPlanText()` |
| `streak` | `{count, lastDate}` | `fc:streak` | `resetAll()` |
| `planText` | `string` | `fc:planText` | `resetAll()` |
| `quote` | `string` | — ephemeral | page reload |
| `tick` | `number` | — ephemeral | every 30s (clock) |

---

## 🎨 Design System

All design tokens are CSS custom properties in [`src/styles/global.css`](./src/styles/global.css):

| Token | Value | Purpose |
|-------|-------|---------|
| `--bg` | `#0d0d0d` | Page background |
| `--surface` | `#161616` | Card / modal background |
| `--surface-2` | `#1e1e1e` | Input / secondary surface |
| `--accent` | `#e8ff47` | Lime-yellow — CTAs, active state |
| `--green` | `#4ade80` | Done / success |
| `--red` | `#f87171` | Error messages |
| `--text` | `#f0ede8` | Primary text |
| `--text-2` | `#888888` | Secondary text |
| `--text-3` | `#555555` | Muted labels |
| `--font-body` | Inter | Body copy |
| `--font-display` | Space Grotesk | Headings, numbers |

**CSS Animations:**

| Class | Keyframe | Use |
|-------|----------|-----|
| `.spin` | 360° rotation, 0.8s linear | Loading spinners |
| `.pulse` | Opacity 1 → 0.4 → 1, 2s | Live dot indicator |
| `.fadeUp` | translateY(12px) → 0, 0.25s | Modal / screen entry |

---

## 🤖 AI Prompt Reference

The serverless function (`netlify/functions/ai.js`) sends one of three prompts:

### `build_schedule`
Converts freeform text into structured JSON blocks.  
**Output:** `Block[]` with `id`, `type`, `icon`, `label`, `sub`, `start`, `end`, and optional `topics` / `criteria` / `note`.

### `interview_questions`
Generates 10 technical interview questions across given topics.  
**Output:** `string[]` — 3 easy, 4 medium, 3 hard. No answers, no numbering.

### `job_search`
Lists 5 realistic remote frontend job opportunities.  
**Output:** `{ title, company, url }[]`

---

## ⚙️ Setup & Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Get an OpenRouter API key

- Sign up at **https://openrouter.ai**
- Go to **Keys → Create key**
- The default model (`openai/gpt-oss-120b:free`) is free — no credits needed

### 3. (Optional) Set up Upstash Redis for rate limiting

- Create a free database at **https://upstash.com**
- Copy **REST URL** and **REST Token**

### 4. Create a `.env` file

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional — rate limiting (skip for local dev)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

> Without Upstash, rate limiting is silently skipped — safe for local development.

### 5. Run locally (full stack)

```bash
npm install -g netlify-cli
netlify dev
```

This starts the Vite dev server **and** the Netlify function emulator together.

> ⚠️ `npm run dev` alone works for the UI, but AI calls will return 404 (no function server).

---

## 🚀 Deploy to Netlify

```bash
netlify login
netlify init          # link to new or existing Netlify site
netlify deploy --prod
```

Then add environment variables in **Netlify Dashboard → Site → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | Your OpenRouter API key |
| `UPSTASH_REDIS_REST_URL` | ⬜ Optional | Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ⬜ Optional | Redis token for rate limiting |

Redeploy after adding variables.

---

## 🔀 Changing the AI Model

In [`netlify/functions/ai.js`](./netlify/functions/ai.js), change the `model` variable:

```js
// Free models
model = "openai/gpt-oss-120b:free";          // default (free)
model = "google/gemma-3-27b-it:free";        // Google Gemma (free)
model = "meta-llama/llama-3-8b-instruct:free"; // Meta Llama (free)

// Paid models (better quality)
model = "openai/gpt-4o-mini";               // fast + smart
model = "anthropic/claude-3-haiku";         // fast Claude
model = "openai/gpt-4o";                    // best quality
```

Browse all available models at **https://openrouter.ai/models**

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Deployment | Netlify |
| Serverless | Netlify Functions |
| AI Provider | OpenRouter (any LLM) |
| Rate Limiting | Upstash Redis |
| Persistence | localStorage |
| Icons | lucide-react |
| Fonts | Inter + Space Grotesk (Google Fonts) |
| Styling | Vanilla CSS with custom properties |

---

## 📄 License

MIT — do whatever you want with it.
