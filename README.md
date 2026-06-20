# ⚡ Scheduler (Focus Control)

> **Stop deciding. Start doing.**  
> An AI-powered daily schedule tracker for job-seekers — built with React, Vite, Express (Node.js), and OpenRouter.

---

## 📸 What It Does

Scheduler turns your rough daily plan written in plain English into a live, time-aware schedule. It generates fresh interview questions, surfaces job listings, and keeps a streak counter to keep you consistent — all in a minimal dark-mode UI optimized for mobile.

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
| 🚦 **Rate Limiting** | Server-side per-IP limits via Upstash Redis (configured in server `.env`) |

---

## 🗂 Project Structure

```
Scheduler/
│
├── index.html                  ← HTML shell (mounts #root, SVG favicon)
├── vite.config.js              ← Vite + React plugin config (proxies /api/* to Express)
├── package.json                ← Root npm configs & workspace run scripts
├── .env.example                ← Frontend environment variables template
│
├── server/                     ← Express API Server
│   ├── .env.example            ← Backend environment variables template
│   ├── index.js                ← Express server main entry
│   ├── package.json            ← Backend npm dependencies & start scripts
│   ├── middleware/
│   │   └── rateLimit.js        ← Upstash Redis rate limiter (fallback to memory)
│   └── routes/
│       └── ai.js               ← Server-side AI route (OpenRouter API client)
│
└── src/                        ← Frontend React application
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
│              Express API Server  (server/index.js)          │
│                                                             │
│  1. Method guard (POST only via router)                     │
│  2. Rate limit check  ──────────► Upstash Redis             │
│       • Configurable req/min and req/day limit              │
│  3. API key guard (OPENROUTER_API_KEY env var)              │
│  4. Build prompt based on { type }                          │
│  5. Call OpenRouter ───────────► LLM (configurable model)   │
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
Express API Server → OpenRouter → JSON array of blocks
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

The Express API Server (`server/routes/ai.js`) sends one of three prompts:

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

Install dependencies for both frontend and backend:
```bash
# Frontend
npm install

# Backend
npm install --prefix ./server
```

### 2. Configure Environment Variables

#### Backend Server Configuration
Create a `.env` file in the `server` directory:
```env
# server/.env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
AI_MODEL=openai/gpt-4o-mini
SERVER_PORT=3001
CORS_ORIGINS=http://localhost:5173

# Optional: Upstash Redis Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_DAY=100
```
> Note: Without Upstash, rate limiting will fall back to an in-memory handler (useful for local development).

#### Frontend Configuration
Create a `.env` file in the root directory:
```env
# .env
VITE_SERVER_URL=http://localhost:3001
VITE_API_URL=/api/ai
```

### 3. Run locally (full stack)

You need to run both the frontend and backend servers.

**Terminal 1: Start Backend Server**
```bash
npm run server:dev
```

**Terminal 2: Start Frontend UI**
```bash
npm run dev
```

The frontend will run at `http://localhost:5173` and automatically proxy AI API calls to the backend on `http://localhost:3001`.

---

## 🚀 Deployment

### Frontend (Static Site)
The frontend can be built and deployed to any static hosting provider (e.g. Netlify, Vercel, GitHub Pages).

```bash
npm run build
```
This will compile the assets into the `dist/` directory, which can be uploaded/served statically. Ensure that your hosting environment sets the necessary frontend `.env` values or configure your proxy settings correctly.

### Backend (Node.js API Server)
The backend is a standard Express app and can be deployed to Node.js hosts (e.g. Render, Heroku, Railway, or a VPS).

Ensure you set the server's environment variables in your deployment dashboard:
- `OPENROUTER_API_KEY` (required)
- `AI_MODEL` (defaults to `openai/gpt-4o-mini`)
- `SERVER_PORT` (configured by hosting platform, e.g. `$PORT`)
- `CORS_ORIGINS` (comma-separated list of your live frontend domain URLs)
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` (optional, for Redis rate limiting)

---

## 🔀 Changing the AI Model

The model is dynamically loaded from the `AI_MODEL` environment variable in the backend's configuration. To change it, update the `AI_MODEL` variable in `server/.env` (or your hosting provider's settings) to any available OpenRouter model ID:

```env
# Free models
AI_MODEL=google/gemma-3-27b-it:free
AI_MODEL=meta-llama/llama-3-8b-instruct:free

# Paid models (better quality)
AI_MODEL=openai/gpt-4o-mini
AI_MODEL=anthropic/claude-3.5-sonnet
```

Browse all available models at **https://openrouter.ai/models**

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Build Tool | Vite 5 |
| API Server | Express.js (Node.js) |
| AI Provider | OpenRouter (any LLM) |
| Rate Limiting | Upstash Redis (with in-memory fallback) |
| Persistence | LocalStorage (client side) |
| Icons | Lucide React |
| Fonts | Inter + Space Grotesk (Google Fonts) |
| Styling | Vanilla CSS |

---

## 📄 License

MIT — do whatever you want with it.
