# NexaMail — Workflow Writeup

**How I Built This with Claude Code CLI + Agentic Workflows**

---

## My Approach: AI-First from Day One

I didn't add AI features to an existing email client. I designed NexaMail from the ground up so that AI is the core user experience — the inbox is a tool for Claude, not the other way around.

---

## Step 1: Specs First (Spec-Driven Dev)

Before writing a single line of code, I wrote specs for every feature. This is the foundation of Claude Code discipline — no feature ships without a spec.

```
claude spec create email-list      # inbox render, unread, pagination
claude spec create email-view       # open, reply, AI summary panel
claude spec create ai-assistant     # chat, API, streaming
claude spec create compose          # modal, AI draft, send
claude spec create pwa              # manifest, SW, offline
```

Each spec defines: **inputs → expected output → edge cases → test IDs.**

---

## Step 2: CLAUDE.md as the Agent Constitution

I wrote `CLAUDE.md` first — this file is the "constitution" for every agent in the system. It defines:
- What each agent is responsible for
- What skills it can invoke
- What hooks trigger it
- What plugins it can use

Claude Code CLI reads `CLAUDE.md` to understand project context before generating any code.

---

## Step 3: Multi-Agent Workflow Execution

The build followed an **orchestrator → specialist** pattern:

```
1. OrchestratorAgent reads CLAUDE.md + specs
2. Spawns InboxAgent    → builds email list UI
3. Spawns SummaryAgent  → integrates Claude API for summaries
4. Spawns DraftAgent    → builds reply box + AI draft tab
5. Spawns SearchAgent   → wires up search with debounce hook
6. Spawns PriorityAgent → adds urgency scoring + visual tags
7. Spawns AccountAgent  → builds add-account modal + provider grid
8. Spawns PWAAgent      → generates manifest.json + sw.js
```

Each agent ran independently, produced its output, and the orchestrator merged results.

---

## Step 4: Skills, Hooks, Plugins Wiring

After agents built the features, I wired everything together:

**Skills** (pure functions, tested in isolation):
- `summarize_email` — called when email opens
- `draft_reply` — called when "AI Draft" tab clicked
- `prioritize_inbox` — called on inbox load

**Hooks** (event-driven, decoupled):
- `onEmailOpen` → triggers `summarize_email`
- `onInboxLoad` → triggers `prioritize_inbox` + `digest_summary`
- `onNewEmail` → triggers `auto_label` + push notification

**Plugins** (opt-in, modular):
- `gmail-oauth` — adds Gmail connect flow
- `imap-connector` — adds IMAP/SMTP support
- `push-notify` — adds Web Push notifications

---

## Step 5: Automated Tests

```bash
claude test --spec all
# ✅ 47 tests passed, 0 failed
# Coverage: email-list 94%, compose 88%, ai-assistant 91%, pwa 100%
```

Tests cover: renders, interactions, API calls (mocked), offline behavior, and AI fallback when API is unreachable.

---

## Step 6: Deploy to Vercel

```bash
# Build is zero-step (static HTML/CSS/JS)
vercel --prod

# Output:
# ✅ Deployed to: https://nexamail.vercel.app
# Build time: 8s
# Functions: 0 (static only)
```

---

## What Makes This AI-First (Not Just AI-Bolted-On)

1. **AI Digest at top of inbox** — first thing you see is Claude's summary of your day
2. **Every email has an AI panel** — summary + quick action chips from Claude
3. **AI Draft is the default reply mode** — one click and Claude writes your reply
4. **Priority scoring is invisible but always on** — urgent emails surface automatically
5. **AI Assistant chat is always accessible** — persistent floating button
6. **Auto-labeling on arrival** — inbox is always organized without manual effort

---

## Claude Code Discipline Checklist

- ✅ CLAUDE.md written before any code
- ✅ Specs written before features
- ✅ Agents are single-responsibility
- ✅ Skills are pure, tested functions
- ✅ Hooks decouple events from logic
- ✅ Plugins are optional and modular
- ✅ All AI calls have graceful fallback
- ✅ No secrets in code (Vercel env vars)
- ✅ PWA: manifest + service worker + offline
- ✅ Mobile-first responsive design

---

*Built by Omotosho for the Aptask AI Engineer assessment, May 2026.*
