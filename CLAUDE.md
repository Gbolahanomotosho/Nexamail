# CLAUDE.md — NexaMail AI Email Client

## Project Overview
NexaMail is an **AI-first universal email client** built as a mobile-ready Progressive Web App (PWA). It supports Gmail, Office 365, and IMAP providers (Yahoo, AOL) with a unified inbox, multi-account switching, and deeply integrated AI features.

**Stack:** Vanilla HTML/CSS/JS (PWA) → deployable on Vercel with zero build step.  
**AI Model:** Claude Sonnet 4 via Anthropic API for all intelligence features.

---

## Agent OS Methodology

This project uses the **Agent OS** (agentic operating system) methodology where each major feature is owned by a dedicated AI agent with a specific skill, clear inputs/outputs, and testable behavior.

### Multi-Agent Architecture

```
Orchestrator Agent
├── InboxAgent         — fetches, sorts, and prioritizes emails
├── SummaryAgent       — generates per-email AI summaries
├── DraftAgent         — writes reply/compose drafts
├── SearchAgent        — semantic search across all mail
├── LabelAgent         — auto-labels incoming mail
├── PriorityAgent      — scores email urgency (0–100)
└── AccountAgent       — manages OAuth + IMAP connections
```

---

## Skills

| Skill | Trigger | Output |
|---|---|---|
| `summarize_email` | Email opened | 1–2 sentence AI summary |
| `draft_reply` | "AI Draft" tab clicked | Full reply draft |
| `draft_compose` | Compose AI button | Full compose draft |
| `prioritize_inbox` | Inbox load | Urgency score per email |
| `auto_label` | New email arrives | Label: Work / Personal / Finance / etc. |
| `search_semantic` | Search query | Ranked results with relevance |
| `digest_summary` | App open / refresh | Top-3 action items from inbox |

---

## Hooks

| Hook | When | What it does |
|---|---|---|
| `onEmailOpen` | Email selected | Triggers `summarize_email` skill |
| `onInboxLoad` | Page load / refresh | Triggers `prioritize_inbox` + `digest_summary` |
| `onNewEmail` | Push/poll notification | Triggers `auto_label` + `prioritize_inbox` |
| `onReplyTabSwitch` | AI Draft tab | Triggers `draft_reply` skill |
| `onComposeSend` | Before send | Validates recipient + subject |
| `onSearch` | Search input (debounced 300ms) | Triggers `search_semantic` |

---

## Plugins

| Plugin | Purpose |
|---|---|
| `gmail-oauth` | OAuth 2.0 flow for Gmail accounts |
| `office365-oauth` | OAuth 2.0 for Microsoft 365 accounts |
| `imap-connector` | IMAP/SMTP for Yahoo, AOL, custom servers |
| `push-notifications` | Web Push API for new email alerts |
| `offline-cache` | Service Worker caching for offline read |
| `pwa-installer` | PWA install prompt handler |

---

## Specs (Spec-Driven Development)

All features are defined as specs before implementation:

```
specs/
├── email-list.spec.js       — inbox render, pagination, unread badge
├── email-view.spec.js       — open, reply, forward, archive, delete
├── compose.spec.js          — compose modal, AI draft, send validation
├── search.spec.js           — query filtering, debounce, empty state
├── account.spec.js          — add account, switch, provider display
├── ai-assistant.spec.js     — chat UI, API call, streaming response
├── priority.spec.js         — urgency scoring, visual indicators
└── pwa.spec.js              — manifest, service worker, offline mode
```

---

## Commands for Claude Code CLI

```bash
# Start dev server
claude run dev

# Run all specs
claude test

# Deploy to Vercel
claude deploy --vercel

# Run the SummaryAgent on a thread
claude agent run SummaryAgent --thread <email_id>

# Generate AI draft for email
claude agent run DraftAgent --email <email_id> --mode reply

# Prioritize inbox
claude agent run PriorityAgent --inbox all

# Add new account
claude agent run AccountAgent --provider gmail --email user@gmail.com
```

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...       # Claude API key
GMAIL_CLIENT_ID=...                # Google OAuth client ID
GMAIL_CLIENT_SECRET=...            # Google OAuth secret
OFFICE365_CLIENT_ID=...            # Microsoft OAuth client ID
OFFICE365_CLIENT_SECRET=...        # Microsoft OAuth secret
IMAP_DEFAULT_HOST=imap.gmail.com   # Default IMAP host
SMTP_DEFAULT_HOST=smtp.gmail.com   # Default SMTP host
```

---

## File Structure

```
nexamail/
├── index.html              # Main app shell (PWA entry point)
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline + caching)
├── CLAUDE.md               # This file — agentic methodology
├── vercel.json             # Vercel deployment config
├── agents/
│   ├── orchestrator.js     # Routes tasks to sub-agents
│   ├── inbox-agent.js      # Email fetching + sorting
│   ├── summary-agent.js    # AI summarization
│   ├── draft-agent.js      # AI reply/compose drafting
│   ├── search-agent.js     # Semantic email search
│   ├── label-agent.js      # Auto-labeling
│   ├── priority-agent.js   # Urgency scoring
│   └── account-agent.js    # OAuth + IMAP management
├── skills/
│   ├── summarize.js        # Email summarization skill
│   ├── draft.js            # Draft generation skill
│   ├── search.js           # Search skill
│   └── prioritize.js       # Priority scoring skill
├── hooks/
│   ├── on-email-open.js    # Fired when email opens
│   ├── on-inbox-load.js    # Fired on inbox load
│   └── on-new-email.js     # Fired on new email arrival
├── plugins/
│   ├── gmail-oauth.js      # Gmail OAuth plugin
│   ├── office365-oauth.js  # Office 365 OAuth plugin
│   ├── imap-connector.js   # IMAP/SMTP plugin
│   └── push-notify.js      # Web Push plugin
└── specs/
    ├── email-list.spec.js
    ├── compose.spec.js
    ├── ai-assistant.spec.js
    └── pwa.spec.js
```

---

## Testing Strategy

- **Unit tests:** Each agent and skill has isolated unit tests
- **Integration tests:** Agent-to-agent communication tested via mock IMAP server
- **E2E tests:** Playwright tests for compose → send, reply, search, account add flows
- **AI quality tests:** Snapshot tests for AI summaries and drafts to prevent regressions

---

## Claude Code Discipline

1. Every feature starts as a spec
2. Agents are atomic — one responsibility each
3. Skills are pure functions — testable in isolation
4. Hooks decouple triggers from logic
5. Plugins are opt-in — core app works without them
6. AI calls are always async with graceful fallback
7. No PII stored — email content processed in-memory only
