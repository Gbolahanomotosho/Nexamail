# NexaMail — Architecture Document

**Version:** 1.0 | **Author:** Omotosho | **Date:** May 2026

---

## 1. System Overview

NexaMail is an **AI-first universal email client** deployed as a Progressive Web App (PWA). It unifies Gmail, Office 365, and IMAP accounts under a single responsive interface, with Claude AI powering every intelligent feature.

```
┌──────────────────────────────────────────────────────────┐
│                     USER (Browser / PWA)                 │
│              Mobile · Desktop · Tablet                   │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────┐
│                  VERCEL CDN / Edge                       │
│          Static Hosting + Edge Functions                 │
└────┬─────────────────┬──────────────────┬────────────────┘
     │                 │                  │
     ▼                 ▼                  ▼
┌─────────┐    ┌──────────────┐   ┌─────────────────┐
│  Gmail  │    │  Office 365  │   │  IMAP / Yahoo   │
│  OAuth  │    │  OAuth 2.0   │   │  AOL / Custom   │
│  API    │    │  Graph API   │   │  IMAP + SMTP    │
└─────────┘    └──────────────┘   └─────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   ANTHROPIC API        │
          │   Claude Sonnet 4      │
          │  (Summary · Draft ·    │
          │   Priority · Search)   │
          └────────────────────────┘
```

---

## 2. Frontend Architecture

```
index.html (Single-file PWA)
├── App Shell          — layout, sidebar, topbar
├── Email List Panel   — virtual-scroll list, AI digest bar
├── Email View Panel   — thread view, AI summary panel, reply box
├── Compose Modal      — compose/forward with AI draft
├── AI Assistant Panel — chat interface powered by Claude
└── Add Account Modal  — OAuth + IMAP provider setup
```

**Design decisions:**
- **No framework** — vanilla JS for zero build complexity, instant Vercel deploy
- **CSS variables** — consistent theming, easy dark/light mode switch
- **PWA** — service worker, manifest, offline read support
- **Mobile-first** — responsive breakpoints, swipe-friendly, touch targets ≥ 44px

---

## 3. Agent Architecture (Multi-Agent Workflow)

```
OrchestratorAgent
│
├── InboxAgent         → Fetch + sort emails from all providers
│   └── Uses: gmail-oauth, office365-oauth, imap-connector plugins
│
├── SummaryAgent       → Per-email AI summary (Claude API)
│   └── Skill: summarize_email
│
├── PriorityAgent      → Score urgency 0–100, add visual indicators
│   └── Skill: prioritize_inbox
│
├── DraftAgent         → Generate reply or compose drafts (Claude API)
│   └── Skill: draft_reply, draft_compose
│
├── SearchAgent        → Semantic search across all accounts
│   └── Skill: search_semantic
│
├── LabelAgent         → Auto-label incoming mail
│   └── Skill: auto_label
│
└── AccountAgent       → Manage OAuth tokens + IMAP credentials
    └── Plugins: gmail-oauth, office365-oauth, imap-connector
```

---

## 4. Data Flow

```
New Email Arrives
      │
      ▼
onNewEmail (Hook)
      │
      ├──► LabelAgent.auto_label()      → assigns Work/Personal/Finance
      ├──► PriorityAgent.score()         → urgency 0–100
      └──► push-notify plugin            → Web Push notification

User Opens Email
      │
      ▼
onEmailOpen (Hook)
      │
      └──► SummaryAgent.summarize()     → Claude API → renders AI panel

User Clicks "AI Draft"
      │
      ▼
DraftAgent.draft_reply()              → Claude API → fills reply textarea

User Searches
      │
      ▼
onSearch (Hook, debounced 300ms)
      │
      └──► SearchAgent.semantic_search() → ranked results
```

---

## 5. AI Integration

All AI features call **Claude Sonnet 4** via the Anthropic Messages API.

| Feature | System Prompt Context | Max Tokens |
|---|---|---|
| Email summary | `"You are an email assistant. Summarize in 1-2 sentences."` | 150 |
| Reply draft | `"You are a professional email writer. Draft a reply."` | 500 |
| Compose draft | `"Draft a professional email based on the subject/intent."` | 500 |
| Priority score | `"Score urgency 0-100. Return JSON {score, reason}."` | 100 |
| Auto-label | `"Classify as: Work/Personal/Finance/Other."` | 50 |
| AI chat assistant | `"You are NexaMail AI. Help manage emails. Be concise."` | 1000 |

**Fallback:** Every AI call has a try/catch — if API is unavailable, the UI degrades gracefully (feature hidden, no crash).

---

## 6. Security Model

| Concern | Mitigation |
|---|---|
| OAuth tokens | Stored in memory only (never localStorage) |
| IMAP passwords | Encrypted in transit (TLS), never logged |
| Email content | Processed in-memory, not persisted to cloud |
| API keys | Injected via Vercel environment variables |
| CSP | `Content-Security-Policy` header on all routes |
| XSS | All user content HTML-escaped before render |

---

## 7. PWA Capabilities

- **Offline read:** Service Worker caches opened emails for offline access
- **Install prompt:** PWA manifest enables "Add to Home Screen" on iOS/Android
- **Push notifications:** Web Push API for new email alerts
- **App-like UX:** Standalone display mode, no browser chrome

---

## 8. Provider Support

| Provider | Auth Method | Capabilities |
|---|---|---|
| Gmail | OAuth 2.0 (Google) | Full CRUD, labels, threads |
| Office 365 | OAuth 2.0 (MSAL) | Full CRUD, folders, categories |
| Yahoo Mail | IMAP/SMTP | Read, send, archive, delete |
| AOL Mail | IMAP/SMTP | Read, send, archive, delete |
| Custom IMAP | IMAP/SMTP | Read, send, archive, delete |

---

## 9. Deployment

- **Host:** Vercel (free tier, auto-deploy from GitHub)
- **CI/CD:** GitHub Actions → Vercel Deploy on push to `main`
- **Domain:** `nexamail.vercel.app` (custom domain optional)
- **Build:** Zero-build static deployment (no bundler required)
- **Env vars:** Set in Vercel dashboard (never in code)
