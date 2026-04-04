# MeowMail Browser Extension — Complete Build Plan

> **Purpose:** This document is the single source of truth for building the MeowMail browser extension. It contains everything needed to build the extension from scratch in a separate repository — architecture, API contract, build order, and implementation details.
>
> **Target Browsers:** Google Chrome (Manifest V3) + Mozilla Firefox (Manifest V2/V3)
>
> **Parent Project:** [https://meowmail.in](https://meowmail.in) — a free, anonymous, disposable email service

---

## Table of Contents

1. [Product Context](#1-product-context)
2. [Extension Overview](#2-extension-overview)
3. [Architecture](#3-architecture)
4. [API Contract](#4-api-contract)
5. [WebSocket Protocol](#5-websocket-protocol)
6. [Address Generation Logic](#6-address-generation-logic)
7. [Tech Stack](#7-tech-stack)
8. [Project Structure](#8-project-structure)
9. [Build Order (5 Steps)](#9-build-order-5-steps)
10. [Permissions](#10-permissions)
11. [UI/UX Spec](#11-uiux-spec)
12. [Cross-Browser Compatibility](#12-cross-browser-compatibility)
13. [Store Submission Checklist](#13-store-submission-checklist)
14. [Configuration](#14-configuration)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [API Change Contract](#16-api-change-contract)
17. [Parent Project Reference — Shared Assets & Files](#17-parent-project-reference--shared-assets--files)

---

## 1. Product Context

MeowMail is a **free, privacy-first disposable email service**. Users generate a random temporary email address, use it anywhere, receive emails in real-time via WebSocket, and the inbox auto-expires after 1 hour. No signup, no accounts, no tracking.

**The extension brings this directly into the browser** — users can generate and use temp emails without ever leaving the page they're on.

**Key product values to preserve in the extension:**
- Zero friction (one click to get an address)
- Privacy-first (minimal permissions, no tracking)
- Clean, dark UI (Midnight Amber theme)
- Real-time delivery (WebSocket, not polling)

---

## 2. Extension Overview

### What It Does

1. **Generate** — Click the extension icon, get a random temp email address
2. **Copy** — One-click copy to clipboard
3. **Autofill** — Detect email input fields on any webpage and offer to fill them
4. **Monitor** — Mini inbox in the popup shows incoming emails in real-time
5. **View** — Read email content (verification codes, confirmation links) without leaving the page
6. **Context Menu** — Right-click any email input → "Fill with MeowMail address"

### What It Does NOT Do

- No email sending (MeowMail is receive-only)
- No account management (there are no accounts)
- No data collection or analytics
- No modification of webpage content beyond autofill

---

## 3. Architecture

```
┌──────────────────────────────────────────────────┐
│  Browser Extension                               │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   Popup    │  │  Content   │  │ Background  │ │
│  │   (UI)     │  │  Script    │  │  Service    │ │
│  │            │  │            │  │  Worker     │ │
│  │ - Address  │  │ - Detect   │  │             │ │
│  │   gen/copy │  │   <input   │  │ - REST API  │ │
│  │ - Mini     │  │   type=    │  │   calls     │ │
│  │   inbox    │  │   email>   │  │ - WebSocket │ │
│  │ - Email    │  │ - Autofill │  │   conn      │ │
│  │   viewer   │  │   overlay  │  │ - Badge     │ │
│  │ - History  │  │ - Context  │  │   counter   │ │
│  │            │  │   menu     │  │ - Storage   │ │
│  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘ │
│        │               │                │        │
│        └───────message passing──────────┘        │
│                        │                         │
└────────────────────────┼─────────────────────────┘
                         │
                         ▼
                   meowmail.in
                 /api/*  +  /socket
```

### Component Responsibilities

#### Background Service Worker (`background/`)
- **Single source of truth** for API communication
- Maintains WebSocket connection to `wss://meowmail.in/socket`
- Manages `chrome.storage.local` for address history and current address
- Updates badge counter on new emails
- Handles context menu creation and clicks
- Relays events to popup via `chrome.runtime` messaging

#### Popup (`popup/`)
- Opens when user clicks the extension icon
- Displays current address with copy button
- Shows address history (last 5-10 addresses)
- Mini inbox: list of emails for current address
- Email detail view: subject, sender, text/HTML body
- Address generation controls (new random, custom input)
- Connection status indicator

#### Content Script (`content/`)
- Runs on all pages (with appropriate matching)
- Detects `<input type="email">` and `<input name="email">` fields
- Shows a small MeowMail icon/overlay near detected fields
- On click: fills the field with the current temp address
- Communicates with background via `chrome.runtime.sendMessage`

### Data Flow

```
[User clicks extension] → Popup opens
  → Popup asks Background for current state
  → Background returns { address, emails, status }
  → Popup renders

[New email arrives at SMTP server]
  → Backend processes and stores
  → Backend broadcasts via Phoenix PubSub
  → WebSocket pushes to Background SW
  → Background updates badge (+1)
  → Background notifies Popup (if open)
  → Popup prepends email to list

[User clicks autofill on a page]
  → Content script sends "get_address" to Background
  → Background returns current address
  → Content script fills the input field
```

---

## 4. API Contract

**Base URL:** `https://meowmail.in` (configurable via env)

All endpoints return JSON. No authentication required.

### Endpoints

#### GET `/api/domains`
Returns active domains.
```json
{
  "domains": [
    { "name": "meowmail.in" }
  ]
}
```

#### GET `/api/inbox/{domain}/{local_part}`
Returns email summaries for an inbox. Supports cursor pagination.

**Query params:** `?before={ulid}` (for pagination)

```json
{
  "emails": [
    {
      "id": "01HXYZ...",
      "sender": "noreply@example.com",
      "subject": "Verify your email",
      "received_at": "2026-04-04T12:00:00Z",
      "has_attachments": false
    }
  ]
}
```

#### GET `/api/emails/{id}`
Returns full email detail.
```json
{
  "email": {
    "id": "01HXYZ...",
    "sender": "noreply@example.com",
    "subject": "Verify your email",
    "text_body": "Your code is 123456",
    "html_body": "<div>Your code is <b>123456</b></div>",
    "has_attachments": false,
    "received_at": "2026-04-04T12:00:00Z",
    "expires_at": "2026-04-04T13:00:00Z"
  }
}
```
**Note:** `html_body` is already sanitized server-side (scripts, iframes, forms, event handlers stripped).

#### GET `/api/emails/{id}/attachments`
Returns attachment metadata.
```json
{
  "attachments": [
    {
      "id": "att_abc123",
      "filename": "receipt.pdf",
      "content_type": "application/pdf",
      "size_bytes": 45320
    }
  ]
}
```

#### GET `/api/emails/{id}/attachments/{attachment_id}`
Returns binary attachment data. Use this URL directly for downloads.

**Full URL pattern:** `https://meowmail.in/api/emails/{email_id}/attachments/{attachment_id}`

#### DELETE `/api/emails/{id}`
Deletes an email. Returns `204 No Content`.

#### GET `/api/health`
Health check.
```json
{
  "status": "ok",
  "db": "ok",
  "smtp": "ok"
}
```

### Error Responses

```json
// 404
{ "errors": { "detail": "Not Found" } }

// 429 (rate limit)
{ "error": "rate limit exceeded" }

// 500
{ "errors": { "detail": "Internal Server Error" } }
```

**Rate Limit:** 100 requests/minute per IP. Extension should handle 429 gracefully (show a toast, back off).

---

## 5. WebSocket Protocol

**Endpoint:** `wss://meowmail.in/socket`

**Library:** Phoenix Channels (uses the Phoenix WebSocket protocol, NOT raw WebSocket)

### Connection

The backend uses [Phoenix Channels](https://hexdocs.pm/phoenix/channels.html). You need a Phoenix-compatible WebSocket client. Options:

1. **`phoenix` npm package** — Official client (~8KB minified). Use the `Socket` and `Channel` classes.
2. **`phoenix-channels` lightweight client** — Smaller alternative if size matters.
3. **Custom implementation** — Phoenix uses a specific JSON protocol over WebSocket. Not recommended unless you need absolute minimal size.

### Channel Protocol

```javascript
import { Socket } from 'phoenix'

const socket = new Socket('wss://meowmail.in/socket', {
  reconnectAfterMs: (tries) => [1000, 2000, 5000, 10000][Math.min(tries - 1, 3)]
})

socket.connect()

// Topic format: "inbox:{localPart}@{domain}"
const channel = socket.channel(`inbox:${localPart}@${domain}`)

channel.join()
  .receive('ok', () => console.log('connected'))
  .receive('error', () => console.log('failed'))
```

### Events

#### `new_email` (server → client)
Fired when a new email arrives in the inbox.
```json
{
  "id": "01HXYZ...",
  "sender": "noreply@example.com",
  "subject": "Verify your email",
  "received_at": "2026-04-04T12:00:00Z",
  "has_attachments": false
}
```

#### `email_expired` (server → client)
Fired when an email is auto-deleted (TTL expired).
```json
{
  "id": "01HXYZ..."
}
```

### Reconnection Strategy
- On disconnect: auto-reconnect with backoff (1s, 2s, 5s, 10s)
- On reconnect: **re-fetch full inbox via REST** to catch any events missed during disconnection
- The frontend already does this — replicate the same pattern

### Service Worker Considerations
- Chrome Manifest V3 service workers can use WebSocket
- Firefox background scripts (persistent) have no issues with WebSocket
- Service workers may be terminated after inactivity — re-establish connection when popup opens or when a content script sends a message

---

## 6. Address Generation Logic

Addresses are generated **client-side** using word lists. No server endpoint needed.

### Format
```
{adjective}-{noun}-{3-digit-number}@{domain}
```
Example: `swift-cat-342@meowmail.in`

### Word Lists

```javascript
const adjectives = [
  'swift', 'fluffy', 'sleepy', 'brave', 'tiny', 'wild', 'cozy', 'fuzzy',
  'lucky', 'quiet', 'sly', 'bold', 'calm', 'cool', 'keen', 'warm',
  'soft', 'quick', 'lazy', 'shy', 'bright', 'witty', 'crisp', 'gentle',
]

const nouns = [
  'cat', 'paw', 'moon', 'star', 'rain', 'fox', 'owl', 'wolf',
  'bear', 'leaf', 'fern', 'moss', 'wind', 'wave', 'dawn', 'dusk',
  'mist', 'iris', 'sage', 'wren', 'moth', 'crow', 'hare', 'lynx',
]
```

### Generator
```javascript
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const digits = () => String(Math.floor(Math.random() * 900) + 100)

const generateLocalPart = () =>
  `${pick(adjectives)}-${pick(nouns)}-${digits()}`
```

### Validation
Local part must match: `/^[a-z0-9][a-z0-9._-]{2,30}$/`

### Domain
Fetch available domains from `GET /api/domains`. Default domain: `meowmail.in`.

---

## 7. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| **Framework** | [WXT](https://wxt.dev/) | Cross-browser extension framework, Vite-based, generates both Chrome MV3 and Firefox MV2 manifests from one codebase |
| **UI** | Preact + HTM or vanilla JS | Popup must be tiny and fast; React is overkill for a popup |
| **Styling** | Tailwind CSS 4 (purged) | Consistency with MeowMail's Midnight Amber theme |
| **WebSocket** | `phoenix` npm package | Required for Phoenix Channel protocol compatibility |
| **Storage** | `chrome.storage.local` | Cross-browser, persists address history |
| **Build** | Vite (via WXT) | Fast builds, tree-shaking, CSS purging |
| **TypeScript** | Yes | Type safety for message passing between components |

### Why WXT?
- Single codebase → Chrome + Firefox output
- Auto-generates manifests for both browsers
- Built on Vite (fast dev, HMR for popup/content)
- Handles the service worker vs background page difference
- Active maintenance, good docs

---

## 8. Project Structure

```
meowmail-extension/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts          # Service worker / background script
│   │   ├── popup/
│   │   │   ├── index.html         # Popup HTML shell
│   │   │   ├── main.ts            # Popup entry point
│   │   │   ├── App.tsx            # Root popup component
│   │   │   ├── components/
│   │   │   │   ├── AddressBar.tsx      # Address display + copy + generate
│   │   │   │   ├── AddressHistory.tsx  # Recent addresses list
│   │   │   │   ├── EmailList.tsx       # Mini inbox
│   │   │   │   ├── EmailDetail.tsx     # Email viewer
│   │   │   │   ├── StatusBadge.tsx     # Connection status
│   │   │   │   └── Toast.tsx           # Notifications
│   │   │   └── styles.css         # Tailwind entry
│   │   └── content.ts             # Content script
│   ├── utils/
│   │   ├── api.ts                 # REST API client
│   │   ├── websocket.ts           # Phoenix WebSocket wrapper
│   │   ├── addressGenerator.ts    # Word list + generator
│   │   ├── storage.ts             # chrome.storage.local helpers
│   │   └── messages.ts            # Message types for runtime messaging
│   └── assets/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
├── public/
│   └── icon/                      # Extension icons
├── wxt.config.ts                  # WXT configuration
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Build Order (5 Steps)

### Step 1: Scaffold + Background Service Worker

**Goal:** Working extension skeleton that connects to MeowMail API.

**Tasks:**
1. Initialize WXT project with TypeScript + Preact
2. Configure Tailwind CSS 4 with Midnight Amber theme colors
3. Implement `utils/api.ts` — REST client (port from frontend's `client.js` + `inbox.js`)
4. Implement `utils/addressGenerator.ts` — word lists + generator
5. Implement `utils/storage.ts` — `chrome.storage.local` wrapper for:
   - `currentAddress: { localPart, domain }`
   - `addressHistory: Array<{ localPart, domain, createdAt }>`
   - `emails: Array<EmailSummary>` (cached for current address)
6. Implement `utils/messages.ts` — typed message definitions for runtime messaging
7. Implement `background.ts`:
   - On install: generate first address, fetch domains, store in storage
   - Listen for messages from popup/content scripts
   - Handle address generation, inbox fetching, email fetching
   - Set up context menu: "Fill with MeowMail address"
8. Create placeholder popup (just "MeowMail Extension" text)
9. Verify it loads in Chrome and Firefox

**Deliverable:** Extension loads, generates address on install, background handles API calls.

---

### Step 2: Popup UI — Address Generation & Copy

**Goal:** Functional popup where users can generate, view, copy, and customize addresses.

**Tasks:**
1. Build `AddressBar` component:
   - Display current address (`localPart@domain`)
   - Copy button (copies to clipboard, shows confirmation)
   - "New address" button (generates random)
   - Editable local part (click to edit, validate against pattern)
   - Domain selector (if multiple domains exist)
2. Build `AddressHistory` component:
   - List of last 5-10 addresses from storage
   - Click to switch to that address
   - Small "x" to remove from history
3. Wire up popup ↔ background messaging:
   - Popup requests current state from background on open
   - Background responds with address + cached emails
4. Style with Midnight Amber theme (MUST match the web app exactly — see theme table in section 11)

**Deliverable:** Popup opens, shows address, copy works, can generate new addresses, history works.

---

### Step 3: Popup UI — Mini Inbox + Real-Time

**Goal:** Live email inbox inside the popup with WebSocket updates.

**Tasks:**
1. Implement `utils/websocket.ts`:
   - Phoenix Socket + Channel wrapper
   - Connect to `wss://meowmail.in/socket`
   - Join `inbox:{localPart}@{domain}`
   - Handle `new_email` and `email_expired` events
   - Reconnection with backoff
   - Re-fetch inbox on reconnect
2. Update `background.ts`:
   - Establish WebSocket connection when an address is active
   - On `new_email`: update cached emails, increment badge, notify popup
   - On `email_expired`: remove from cache, notify popup
   - On address change: leave old channel, join new one
   - Handle service worker wake-up: re-establish connection if needed
3. Build `EmailList` component:
   - List of email summaries (sender, subject, time)
   - "has_attachments" indicator
   - Click to view detail
   - Empty state: "No emails yet — use this address and emails will appear here"
   - Loading skeleton
4. Build `StatusBadge` component:
   - Green dot: connected
   - Yellow dot: reconnecting
   - Red dot: error
5. Badge counter:
   - Show unread count on extension icon
   - Reset when popup is opened
   - `chrome.action.setBadgeText`

**Deliverable:** Emails appear in real-time in popup, badge shows count, connection status visible.

---

### Step 4: Email Detail + Content Script + Context Menu

**Goal:** View email content in popup, autofill on pages.

**Tasks:**
1. Build `EmailDetail` component:
   - Back button to return to list
   - Subject, sender, timestamp, expiry info
   - Text body (default view)
   - HTML body rendered in sandboxed iframe (if available)
   - "Open in MeowMail" link → opens `https://meowmail.in/inbox/{domain}/{localPart}?email={id}`
   - Attachment list (filename, size, download link)
   - Delete button
2. Implement `content.ts`:
   - On page load: scan for `<input type="email">`, `<input name="email">`, `<input placeholder="*email*">`, `<input autocomplete="email">`
   - Show a small MeowMail icon (🐱 or branded) next to/inside detected fields
   - On icon click: request current address from background → fill the field
   - Dispatch `input` and `change` events after filling (so page frameworks detect the change)
   - Don't show on pages where the user might not want it (banking sites, etc.) — rely on user clicking, not auto-filling
3. Context menu:
   - Right-click on any editable field → "Fill with MeowMail address"
   - Background script handles `chrome.contextMenus.onClicked`
   - Sends message to content script to fill the focused field

**Deliverable:** Can view full email in popup, can autofill email fields on any page, context menu works.

---

### Step 5: Cross-Browser Polish + Store Submission

**Goal:** Production-ready extension published on Chrome Web Store and Firefox AMO.

**Tasks:**
1. Cross-browser testing:
   - Test all flows in Chrome (Manifest V3)
   - Test all flows in Firefox (Manifest V2 via WXT)
   - Fix any API differences (e.g., `browser.*` vs `chrome.*`)
2. Extension icons:
   - 16x16, 32x32, 48x48, 128x128 PNG icons
   - Use MeowMail cat branding
   - Ensure icons look good on both light and dark browser themes
3. Error handling polish:
   - Network errors → "Can't reach MeowMail servers" message
   - Rate limit (429) → "Too many requests, please wait" toast
   - Invalid address → validation feedback
   - WebSocket disconnect → auto-reconnect with status indicator
4. Popup animations:
   - Smooth transitions between list ↔ detail views
   - Copy button confirmation animation
   - New email slide-in animation
5. Keyboard shortcuts:
   - Consider `Alt+M` or similar to open popup
   - `Ctrl+Shift+C` to copy current address
6. Store listing preparation:
   - Screenshots (5+ for Chrome, 1+ for Firefox)
   - Short description (132 chars max for Chrome)
   - Full description
   - Privacy policy (link to meowmail.in/privacy)
   - Category: Productivity
7. Chrome Web Store submission:
   - $5 one-time developer fee
   - Submit for review (usually 1-3 business days)
8. Firefox AMO submission:
   - Free
   - Submit for review (usually 1-2 days)

**Deliverable:** Published on both stores, or ready for review.

---

## 10. Permissions

### Chrome (Manifest V3)

```json
{
  "manifest_version": 3,
  "name": "MeowMail — Disposable Email",
  "version": "1.0.0",
  "description": "Generate temporary email addresses instantly. No signup, no tracking.",
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://meowmail.in/*"
  ],
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### Firefox (Manifest V2)

WXT generates this automatically. Key differences:
- `"manifest_version": 2`
- `"background": { "scripts": ["background.js"] }` (persistent background page, not service worker)
- `"browser_action"` instead of `"action"`
- `browser.*` API namespace (WXT polyfills this)

### Permission Justifications (for store review)

| Permission | Justification |
|------------|--------------|
| `activeTab` | To detect email input fields on the current page for autofill |
| `storage` | To store address history and cached emails locally |
| `contextMenus` | To add "Fill with MeowMail address" to right-click menu |
| `clipboardWrite` | To copy the generated email address with one click |
| `host_permissions: meowmail.in` | To communicate with the MeowMail API for inbox data |

**No scary permissions.** No `<all_urls>` host permission, no `tabs`, no `webRequest`. This helps with store approval speed.

---

## 11. UI/UX Spec

### Popup Dimensions
- **Width:** 380px (fixed)
- **Height:** 500px (max, scrollable)
- This is comfortable for reading emails without feeling cramped

### Theme: Midnight Amber (EXACT match with MeowMail web app)

> **CRITICAL:** The extension MUST use the identical design language as the web app.
> These values are copied from `frontend/src/index.css`. If they ever drift, update here.

```css
:root {
  /* Backgrounds */
  --color-midnight: #08080c;        /* Page background (deepest) */
  --color-surface: #111118;         /* Card/panel background */
  --color-elevated: #1a1a24;        /* Hover states, elevated surfaces */
  --color-border: #2a2a38;          /* Borders */
  --color-border-subtle: #1e1e2a;   /* Subtle dividers */

  /* Amber accent (the signature MeowMail color) */
  --color-amber: #f5a623;           /* Primary accent — buttons, links, active states */
  --color-amber-dim: #a16e14;       /* Dimmed amber — secondary actions */
  --color-amber-glow: rgba(245, 166, 35, 0.12);  /* Ambient glow backgrounds */

  /* Text */
  --color-text-primary: #ede9e3;    /* Primary text */
  --color-text-secondary: #8a8694;  /* Secondary/muted text */
  --color-text-muted: #5c586a;      /* Dimmed text, placeholders */

  /* Status */
  --color-success: #34d399;         /* Connected, success states */
  --color-danger: #f87171;          /* Error, delete, disconnect */
  --color-info: #60a5fa;            /* Info badges */
}
```

### Design System Rules (from the web app)
- **Font:** Monospace (`font-mono`) for body, display font for headings
- **Buttons:** `bg-amber text-midnight font-semibold` — amber background with dark text
- **Inputs:** `border-amber/30 bg-elevated` — subtle amber border on elevated background
- **Cards:** `bg-surface` with `border-border` — use surface color, not midnight
- **Focus/active states:** `border-amber/40 text-text-primary`
- **Gradients:** `linear-gradient(135deg, #f5a623, #fcd34d)` for accent text
- **Glow effect:** Use `amber-glow` color for subtle background highlights
- **Scrollbar:** `scrollbar-color: var(--color-border) transparent`
- **Anti-aliasing:** Always apply `antialiased`

### Popup Views (3 views, single-page navigation)

#### View 1: Main (Address + Inbox)
```
┌─────────────────────────────────┐
│ 🐱 MeowMail          [●] Live  │  ← Header + connection status
├─────────────────────────────────┤
│                                 │
│  swift-cat-342@meowmail.in      │  ← Current address (editable)
│  [📋 Copy]  [🔄 New]  [▾ History] │  ← Actions
│                                 │
├─────────────────────────────────┤
│  Inbox (2)                      │  ← Email list header
│                                 │
│  ┌─────────────────────────────┐│
│  │ noreply@example.com         ││
│  │ Verify your email address   ││  ← Email summary row
│  │ 2 min ago              📎  ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ hello@service.com           ││
│  │ Welcome to our platform!    ││  ← Email summary row
│  │ 5 min ago                   ││
│  └─────────────────────────────┘│
│                                 │
│  ─── Expires in 54 min ───     │  ← Expiry reminder
│                                 │
├─────────────────────────────────┤
│  Open full inbox ↗              │  ← Link to meowmail.in
└─────────────────────────────────┘
```

#### View 2: Email Detail
```
┌─────────────────────────────────┐
│ ← Back                 🗑 Delete│  ← Navigation
├─────────────────────────────────┤
│                                 │
│  Verify your email address      │  ← Subject
│  From: noreply@example.com      │  ← Sender
│  2 min ago · Expires in 58 min  │  ← Timestamps
│                                 │
├─────────────────────────────────┤
│                                 │
│  Your verification code is:     │
│                                 │
│  123456                         │  ← Email body (text or HTML)
│                                 │
│  Click here to verify →         │
│                                 │
├─────────────────────────────────┤
│  📎 receipt.pdf (44 KB)  ⬇     │  ← Attachments (if any)
├─────────────────────────────────┤
│  Open in MeowMail ↗            │  ← Link to full web view
└─────────────────────────────────┘
```

#### View 3: Address History (dropdown/panel)
```
┌─────────────────────────────────┐
│  Recent Addresses               │
│                                 │
│  brave-fox-217@meowmail.in  ✕  │
│  cozy-moon-891@meowmail.in  ✕  │
│  quiet-wren-456@meowmail.in ✕  │
│                                 │
│  [Clear all]                    │
└─────────────────────────────────┘
```

### Content Script Overlay
```
┌──────────────────────────────────────┐
│ Email: [                    ] [🐱]   │  ← Small cat icon appears
└──────────────────────────────────────┘
                                  │
                                  ▼ (on click)
                    ┌──────────────────────┐
                    │ 🐱 Fill with:        │
                    │ swift-cat-342        │
                    │   @meowmail.in       │
                    │                      │
                    │ [Fill]  [New address] │
                    └──────────────────────┘
```

---

## 12. Cross-Browser Compatibility

| Feature | Chrome (MV3) | Firefox (MV2/3) | Notes |
|---------|-------------|-----------------|-------|
| Service Worker | Yes (required) | Background page | WXT handles this |
| WebSocket in BG | Yes | Yes | Both support it |
| `chrome.storage` | Yes | `browser.storage` | WXT polyfills |
| `chrome.action` | Yes | `browser.browserAction` (MV2) | WXT polyfills |
| Context menus | Yes | Yes | Same API |
| Clipboard write | Yes | Yes | Same API |
| Content scripts | Yes | Yes | Same API |
| Manifest version | V3 only | V2 or V3 | WXT generates both |

**WXT handles most differences.** The main thing to watch:
- Firefox MV2 background pages are persistent (good for WebSocket)
- Chrome MV3 service workers can be terminated (must handle reconnection)

---

## 13. Store Submission Checklist

### Chrome Web Store
- [ ] Developer account ($5 one-time fee)
- [ ] Extension ZIP file (WXT builds this)
- [ ] Screenshots: 1280x800 or 640x400 (at least 1, ideally 5)
- [ ] Promo tile: 440x280 (small), 920x680 (large) — optional
- [ ] Short description (132 chars max)
- [ ] Full description
- [ ] Category: Productivity
- [ ] Privacy policy URL: `https://meowmail.in/privacy`
- [ ] Single purpose description (for review): "Generates temporary email addresses and displays incoming emails"
- [ ] Justify each permission

### Firefox AMO (addons.mozilla.org)
- [ ] Developer account (free)
- [ ] Extension ZIP or XPI
- [ ] Screenshots (at least 1)
- [ ] Summary and description
- [ ] Category: Privacy & Security
- [ ] License: choose appropriate
- [ ] Privacy policy URL

### Store Descriptions

**Short (Chrome, 132 chars):**
> Generate temporary email addresses instantly. Receive emails in real-time. No signup, no tracking, no ads. Privacy-first disposable email.

**Full:**
> MeowMail brings disposable email directly to your browser. Generate a random temporary email address with one click, use it on any website, and watch emails arrive in real-time — all without leaving the page you're on.
>
> Features:
> - One-click temporary email generation
> - Real-time inbox in the popup (WebSocket, not polling)
> - Autofill email fields on any website
> - Right-click context menu to fill email inputs
> - Copy address to clipboard instantly
> - View full email content including HTML
> - Download attachments
> - Address history (stored locally, never on our servers)
> - Clean dark theme
>
> Privacy:
> - No account required
> - No cookies, no tracking, no analytics
> - Emails auto-expire after 1 hour
> - Minimal permissions — we only connect to meowmail.in
>
> Perfect for: website signups, verification codes, free trials, newsletter previews, developer testing, and reducing your digital footprint.

---

## 14. Configuration

### Environment Variables

```typescript
// Default configuration
const CONFIG = {
  API_BASE_URL: 'https://meowmail.in',
  WS_URL: 'wss://meowmail.in/socket',
  DEFAULT_DOMAIN: 'meowmail.in',
  MAX_HISTORY: 10,          // Max addresses to remember
  BADGE_COLOR: '#f59e0b',   // Amber
  LOCAL_PART_PATTERN: /^[a-z0-9][a-z0-9._-]{2,30}$/,
}
```

### Storage Schema

```typescript
interface StorageSchema {
  currentAddress: {
    localPart: string
    domain: string
  } | null

  addressHistory: Array<{
    localPart: string
    domain: string
    createdAt: string  // ISO timestamp
  }>

  // Cached emails for the current address (for instant popup display)
  cachedEmails: Array<{
    id: string
    sender: string
    subject: string
    received_at: string
    has_attachments: boolean
  }>

  unreadCount: number
}
```

### Message Types (Background ↔ Popup ↔ Content)

```typescript
// Popup/Content → Background
type RequestMessage =
  | { type: 'GET_STATE' }
  | { type: 'GENERATE_ADDRESS' }
  | { type: 'SET_ADDRESS'; localPart: string; domain: string }
  | { type: 'GET_EMAIL'; id: string }
  | { type: 'DELETE_EMAIL'; id: string }
  | { type: 'GET_CURRENT_ADDRESS' }  // Used by content script
  | { type: 'CLEAR_BADGE' }

// Background → Popup (via runtime messaging or storage change)
type EventMessage =
  | { type: 'STATE_UPDATE'; state: StorageSchema }
  | { type: 'NEW_EMAIL'; email: EmailSummary }
  | { type: 'EMAIL_EXPIRED'; id: string }
  | { type: 'CONNECTION_STATUS'; status: 'connected' | 'disconnected' | 'error' }
```

---

## 15. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Chrome Web Store review rejection | Medium | Minimal permissions, clear single-purpose description, privacy policy |
| Service worker termination (Chrome) | Medium | Re-establish WebSocket on wake-up; use storage as source of truth, not in-memory state |
| Phoenix WebSocket protocol compat | Low | Use official `phoenix` npm package; test thoroughly |
| Rate limiting extension users | Low | Extension makes same calls as web app; 100 req/min is generous |
| Content script conflicts with page JS | Low | Use shadow DOM or isolated approach for overlays; minimal DOM mutation |
| MeowMail API changes break extension | Medium | **See section 16 below** — coordinate changes via EXTENSION_PLAN |
| Firefox MV3 migration | Low | WXT supports both; Firefox is moving to MV3 anyway |

---

## 16. API Change Contract

> **IMPORTANT: For the MeowMail backend team (main repo)**
>
> The browser extension depends on these API surfaces. If any of these change,
> the extension MUST be updated too. Coordinate before deploying breaking changes.

### Extension depends on:

1. **REST Endpoints:**
   - `GET /api/domains` → `{ domains: [{ name }] }`
   - `GET /api/inbox/:domain/:local_part` → `{ emails: [...] }` with `?before=` pagination
   - `GET /api/emails/:id` → `{ email: { id, sender, subject, text_body, html_body, has_attachments, received_at, expires_at } }`
   - `GET /api/emails/:id/attachments` → `{ attachments: [...] }`
   - `GET /api/emails/:id/attachments/:attachment_id` → binary
   - `DELETE /api/emails/:id` → 204

2. **WebSocket:**
   - Endpoint: `/socket` (Phoenix Socket)
   - Channel topic: `inbox:{localPart}@{domain}`
   - Events: `new_email` (with email summary), `email_expired` (with `{ id }`)

3. **Response schemas:** Field names and types as documented above

4. **Error format:** `{ error: "..." }` for 429, `{ errors: { detail: "..." } }` for 4xx/5xx

5. **Address rules:** local part pattern `/^[a-z0-9][a-z0-9._-]{2,30}$/`

### What's safe to change (won't break extension):
- Adding new fields to existing responses
- Adding new endpoints
- Changing rate limit numbers
- Backend implementation details
- Adding new WebSocket events

### What will break the extension:
- Removing or renaming any of the above endpoints
- Changing response field names or nesting
- Changing the WebSocket topic format or event names
- Adding required authentication
- Changing the address validation pattern
- Removing STARTTLS or changing the socket path

---

## 17. Parent Project Reference — Shared Assets & Files

> **IMPORTANT FOR THE AGENT BUILDING THIS EXTENSION:**
>
> The MeowMail web app (the parent project) lives in a sibling directory on this machine.
> You do NOT have direct write access to that repo, but you CAN read files from it
> when you need reference material, assets, or design tokens.

### Parent Project Location

```
/Users/jay/Developer/meowmail/
```

### When to Access the Parent Project

- **Copying brand assets** (icons, SVGs) for extension icons
- **Verifying exact theme values** if the design tokens in this plan feel stale
- **Checking API behavior** by reading controller/router code
- **Referencing frontend patterns** (component structure, animations, etc.)

### Key Files You May Need to Read

| What | Path | Why |
|------|------|-----|
| **Cat favicon SVG** | `/Users/jay/Developer/meowmail/frontend/public/favicon.svg` | Source for extension icon — amber cat head, 32x32 viewBox |
| **Pre-rendered PNGs** | `/Users/jay/Developer/meowmail/frontend/public/favicon-16.png` | 16px icon — can use directly |
| | `/Users/jay/Developer/meowmail/frontend/public/favicon-32.png` | 32px icon — can use directly |
| | `/Users/jay/Developer/meowmail/frontend/public/favicon-192.png` | 192px icon — can resize to 128px |
| | `/Users/jay/Developer/meowmail/frontend/public/favicon-512.png` | 512px icon — hi-res source |
| **Full theme CSS** | `/Users/jay/Developer/meowmail/frontend/src/index.css` | Authoritative Midnight Amber theme — all CSS variables, utilities, component styles |
| **Icon sprite** | `/Users/jay/Developer/meowmail/frontend/public/icons.svg` | Social icons (GitHub, X, Bluesky, Discord) if needed for store listing |
| **OG image** | `/Users/jay/Developer/meowmail/frontend/public/og-image.png` | Store listing promo image source (45KB) |
| **Address generator** | `/Users/jay/Developer/meowmail/frontend/src/utils/addressGenerator.js` | Canonical word lists + generator logic (copy into extension, keep in sync) |
| **API client** | `/Users/jay/Developer/meowmail/frontend/src/api/client.js` | Reference for API call patterns, error handling, 429 handling |
| **Inbox API** | `/Users/jay/Developer/meowmail/frontend/src/api/inbox.js` | Reference for endpoint paths, query params, response unwrapping |
| **Attachments API** | `/Users/jay/Developer/meowmail/frontend/src/api/attachments.js` | Reference for attachment endpoints, download URL pattern |
| **WebSocket hook** | `/Users/jay/Developer/meowmail/frontend/src/hooks/useInboxChannel.js` | Reference for Phoenix Channel connection pattern, reconnect strategy |
| **Config** | `/Users/jay/Developer/meowmail/frontend/src/config.js` | Reference for URL patterns, local part validation regex, localStorage keys |
| **Product reference** | `/Users/jay/Developer/meowmail/docs/PRODUCT_REFERENCE.md` | Branding, messaging, store listing copy |
| **Backend router** | `/Users/jay/Developer/meowmail/lib/meowmail_web/router.ex` | Source of truth for all API endpoints |

### How to Access These Files

Use the `Read` tool with the absolute paths listed above. Examples:

```
Read /Users/jay/Developer/meowmail/frontend/public/favicon.svg
Read /Users/jay/Developer/meowmail/frontend/src/index.css
Read /Users/jay/Developer/meowmail/frontend/src/utils/addressGenerator.js
```

### Asset Pipeline for Extension Icons

The extension needs PNG icons at 16, 32, 48, and 128px. Strategy:

1. **16px and 32px** — Copy directly from parent: `favicon-16.png`, `favicon-32.png`
2. **48px** — Generate from `favicon.svg` (resize) or from `favicon-192.png` (downscale)
3. **128px** — Downscale from `favicon-192.png` or `favicon-512.png`
4. **SVG source** — `favicon.svg` is the canonical cat icon (amber `#F5A623` stroke on transparent)

If you need to regenerate icons at different sizes, read `favicon.svg` and use it as the source.

### Keeping Things in Sync

These items exist in BOTH repos and must stay in sync:

| Item | Parent location | Extension location | Sync strategy |
|------|----------------|-------------------|---------------|
| Word lists (adjectives, nouns) | `frontend/src/utils/addressGenerator.js` | `src/utils/addressGenerator.ts` | Copy on build; changes are rare |
| Theme colors | `frontend/src/index.css` | `src/entrypoints/popup/styles.css` | Copy exact values; verify periodically |
| Local part regex | `frontend/src/config.js` | `src/utils/addressGenerator.ts` | `/^[a-z0-9][a-z0-9._-]{2,30}$/` |
| API base URL pattern | `frontend/src/config.js` | `src/utils/api.ts` | Both default to `https://meowmail.in` |
| Cat icon | `frontend/public/favicon.svg` | `src/assets/` | Copy once; only changes if branding changes |

> **Note to future agents:** If you ever get a task that changes word lists, theme colors,
> the local part pattern, or icon branding in the parent project, remind the user that the
> extension repo needs the same update.

---

*Last updated: 2026-04-04*
*This document should be copied to the extension repository as a build reference.*
