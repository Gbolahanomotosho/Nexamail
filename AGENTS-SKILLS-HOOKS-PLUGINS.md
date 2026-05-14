# NexaMail — Agents, Skills, Hooks & Plugins

---

## 🤖 Agents

| Agent | Responsibility | Inputs | Outputs |
|---|---|---|---|
| `OrchestratorAgent` | Routes tasks, coordinates all sub-agents, manages state | User actions, system events | Task assignments to sub-agents |
| `InboxAgent` | Fetches, normalizes, and sorts emails from all providers | Account credentials, provider type | Unified email array with metadata |
| `SummaryAgent` | Generates 1–2 sentence AI summaries per email | Email body + subject + sender | Summary string + key action items |
| `DraftAgent` | Writes contextual reply or compose drafts using Claude | Email thread context + draft type | Draft text for reply/compose textarea |
| `SearchAgent` | Performs semantic search across all accounts | Query string + email corpus | Ranked, filtered email results |
| `LabelAgent` | Automatically labels incoming emails by category | Email content + sender metadata | Label: Work / Personal / Finance / Other |
| `PriorityAgent` | Scores email urgency 0–100 and categorizes as High/Med/Low | Email content, sender, subject | Urgency score + visual tag |
| `AccountAgent` | Manages OAuth flows, IMAP config, token refresh | Provider type + user credentials | Auth tokens, connection status |

---

## 🛠️ Skills

| Skill | Agent Owner | Description | Input → Output |
|---|---|---|---|
| `summarize_email` | SummaryAgent | Calls Claude API to summarize one email | Email body → 1–2 sentence summary |
| `draft_reply` | DraftAgent | Generates contextual reply draft | Email thread → Reply text draft |
| `draft_compose` | DraftAgent | Generates cold compose draft from subject/intent | Subject + intent → Compose body |
| `prioritize_inbox` | PriorityAgent | Scores all emails and returns sorted priority list | Email array → Scored + sorted array |
| `auto_label` | LabelAgent | Classifies email into category | Email metadata → Label string |
| `search_semantic` | SearchAgent | Filters emails using query matching | Query string → Filtered emails |
| `digest_summary` | SummaryAgent | Generates top-3 action items from full inbox | Inbox array → Digest string |
| `score_urgency` | PriorityAgent | Returns urgency score + reason for one email | Email → {score: 0–100, reason: string} |

---

## 🪝 Hooks

| Hook | Trigger Event | Skills Invoked | Side Effects |
|---|---|---|---|
| `onEmailOpen` | User selects an email | `summarize_email` | Renders AI summary panel, marks as read |
| `onInboxLoad` | App opens or refresh button clicked | `prioritize_inbox`, `digest_summary` | Renders AI digest bar, sorts list by priority |
| `onNewEmail` | New email arrives (poll/push) | `auto_label`, `score_urgency` | Adds label tag, updates unread badge, push notification |
| `onReplyTabSwitch` | "AI Draft" tab clicked | `draft_reply` | Fills reply textarea with generated draft |
| `onComposeAI` | AI button in compose modal | `draft_compose` | Fills compose body with AI-generated text |
| `onSearch` | Search input (debounced 300ms) | `search_semantic` | Filters and re-renders email list |
| `onAccountAdd` | User confirms account form | *(AccountAgent)* | OAuth flow or IMAP test, adds account pill |
| `onSend` | Send button clicked (reply/compose) | *(validation)* | Validates recipient/subject, sends via SMTP/API |

---

## 🔌 Plugins

| Plugin | Purpose | When Active |
|---|---|---|
| `gmail-oauth` | Handles Google OAuth 2.0 authorization flow for Gmail accounts | When user adds a Gmail account |
| `office365-oauth` | Handles Microsoft OAuth 2.0 (MSAL) for Office 365 accounts | When user adds an Office 365 account |
| `imap-connector` | IMAP read + SMTP send for Yahoo, AOL, and custom mail servers | When user adds a Yahoo/AOL/custom account |
| `push-notifications` | Web Push API for new email alerts in background/foreground | After user grants notification permission |
| `offline-cache` | Service Worker caches HTML, assets, and opened emails | Always active (registered on app load) |
| `pwa-installer` | Intercepts `beforeinstallprompt`, shows "Install App" button | When browser supports PWA install |

---

## Summary Count

| Category | Count |
|---|---|
| Agents | 8 |
| Skills | 8 |
| Hooks | 8 |
| Plugins | 6 |
| **Total** | **30** |
