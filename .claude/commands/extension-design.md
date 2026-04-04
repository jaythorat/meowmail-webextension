---
name: extension-design
description: Build the MeowMail browser extension (Chrome + Firefox) with production-grade UI, Midnight Amber theme, and cross-browser compatibility. Use this when building extension components, popup UI, content scripts, or background workers.
---

This skill guides creation of the MeowMail browser extension — a Chrome + Firefox extension that brings disposable email directly into the browser. Every component must feel like a natural satellite of the MeowMail web app: same theme, same quality, same personality.

The user provides extension requirements: a component, popup view, content script behavior, or background worker feature. They may include context about which build step they're on (see Build Order below).

## Design Thinking

Before coding, understand the context:
- **Purpose**: This is a utility extension — users reach for it mid-signup on another website. Speed and clarity beat decoration.
- **Tone**: Dark, focused, slightly playful (cat branding). The popup should feel like a compact control panel, not a mini web app.
- **Constraints**: Popup is 380x500px max. Every pixel matters. No scrolling for core actions.
- **Differentiation**: Real-time email arrival in a browser popup is the "wow" moment. Make it feel instant and alive.

**CRITICAL**: The extension MUST visually match the MeowMail web app. Same Midnight Amber theme, same fonts, same color values. A user moving between the web app and extension should feel zero visual discontinuity.

Then implement working code that is:
- Production-grade and functional across Chrome and Firefox
- Visually identical to MeowMail's Midnight Amber aesthetic
- Compact and information-dense without feeling cramped
- Fast to open, fast to use, fast to dismiss

---

## Tech Stack

**Framework**: [WXT](https://wxt.dev/) — cross-browser extension framework, generates Chrome MV3 + Firefox MV2 from one codebase
**UI**: Preact (3KB) with HTM or JSX — React is too heavy for a popup
**Styling**: Tailwind CSS v4 — utility-first with purged output. Same approach as the web app
**WebSocket**: `phoenix` npm package — required for Phoenix Channel protocol compatibility
**Storage**: `chrome.storage.local` — cross-browser, persists address history
**TypeScript**: Yes — type safety for message passing between background/popup/content
**Icons**: SVG inline — use the MeowMail cat icon from parent project assets
**Build**: Vite (via WXT) — fast builds, tree-shaking, CSS purging

### Why NOT React?
The popup must open instantly. React adds ~40KB+ to the bundle. Preact gives the same component model at 3KB. For a 380px popup with 3 views, Preact is the right call.

---

## Midnight Amber Theme (EXACT values from web app)

**These are non-negotiable.** Copied from the parent project's `frontend/src/index.css`.

```css
:root {
  /* Backgrounds */
  --color-midnight: #08080c;        /* Deepest background */
  --color-surface: #111118;         /* Card/panel background */
  --color-elevated: #1a1a24;        /* Hover states, elevated surfaces */
  --color-border: #2a2a38;          /* Borders */
  --color-border-subtle: #1e1e2a;   /* Subtle dividers */

  /* Amber accent (signature MeowMail color) */
  --color-amber: #f5a623;           /* Primary accent — buttons, links, active */
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

### Design System Rules
- **Font**: Monospace (`font-mono`) for body text. Display font for headers if available.
- **Buttons**: `bg-amber text-midnight font-semibold` — amber background with dark text
- **Inputs**: `border-amber/30 bg-elevated` — subtle amber border on elevated background
- **Cards/Panels**: `bg-surface` with `border-border`
- **Focus/active states**: `border-amber/40 text-text-primary`
- **Glow effect**: Use `amber-glow` for subtle background highlights
- **Scrollbar**: `scrollbar-color: var(--color-border) transparent`
- **Anti-aliasing**: Always apply `antialiased`

### What NOT to Use
- Do NOT use generic colors (#f59e0b, #1a1a2e, etc.) — use the EXACT hex values above
- Do NOT use Inter, Roboto, Arial, or system fonts
- Do NOT use purple gradients, blue accents, or any non-amber highlight color
- Do NOT create a "light mode" — the extension is dark-only, matching the web app

---

## Extension Architecture

The extension has 3 components that communicate via `chrome.runtime` messaging:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Popup     │  │   Content    │  │  Background   │
│    (UI)      │  │   Script     │  │  Service      │
│              │  │              │  │  Worker       │
│ Renders UI,  │  │ Detects      │  │              │
│ user actions │  │ email inputs │  │ API calls,   │
│              │  │ on pages     │  │ WebSocket,   │
│              │  │              │  │ storage,     │
│              │  │              │  │ badge count  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────── chrome.runtime.sendMessage ─┘
```

### Background Service Worker — The Brain
- Single source of truth for all state
- Makes ALL API calls (popup/content never call the API directly)
- Maintains WebSocket connection
- Manages `chrome.storage.local`
- Updates badge counter
- Handles context menu

### Popup — The Face
- Opens when user clicks extension icon
- Requests state from background on open
- Renders 3 views: Main (address + inbox), Email Detail, Address History
- Sends user actions to background via messaging
- Receives live updates from background

### Content Script — The Helper
- Runs on all pages at `document_idle`
- Scans for email input fields
- Shows MeowMail autofill icon near detected fields
- Asks background for current address when user clicks autofill
- Dispatches proper `input`/`change` events after filling

---

## API Contract (MeowMail Backend)

**Production**: `https://meowmail.in`
**Dev**: `http://localhost:4000`

All endpoints return JSON. No authentication required.

### REST Endpoints

| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/api/domains` | `{ domains: [{ name }] }` |
| `GET` | `/api/inbox/:domain/:local_part` | `{ emails: [{ id, sender, subject, received_at, has_attachments }] }` |
| `GET` | `/api/inbox/:domain/:local_part?before=:id` | Same (cursor pagination) |
| `GET` | `/api/emails/:id` | `{ email: { id, sender, subject, text_body, html_body, has_attachments, received_at, expires_at } }` |
| `GET` | `/api/emails/:id/attachments` | `{ attachments: [{ id, filename, content_type, size_bytes }] }` |
| `GET` | `/api/emails/:id/attachments/:attachment_id` | Binary (download) |
| `DELETE` | `/api/emails/:id` | 204 No Content |

**Error envelope**: `{ "errors": { "detail": "..." } }` | Rate limit: `429` → `{ "error": "rate limit exceeded" }` at 100 req/min/IP

### WebSocket (Phoenix Channels)

```typescript
import { Socket } from 'phoenix'

const socket = new Socket('wss://meowmail.in/socket', {
  reconnectAfterMs: (tries) => [1000, 2000, 5000, 10000][Math.min(tries - 1, 3)]
})
socket.connect()

const channel = socket.channel(`inbox:${localPart}@${domain}`)
channel.join()
  .receive('ok', () => { /* connected */ })
  .receive('error', () => { /* failed */ })

channel.on('new_email', (payload) => { /* { id, sender, subject, received_at, has_attachments } */ })
channel.on('email_expired', (payload) => { /* { id } */ })
```

**MUST use the `phoenix` npm package** — raw WebSocket won't work with Phoenix framing.
On reconnect: re-fetch full inbox via REST to catch missed events.

---

## Address Generation (Client-Side)

No server endpoint needed. Generate locally using word lists.

```typescript
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

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const digits = () => String(Math.floor(Math.random() * 900) + 100)

export const generateLocalPart = () =>
  `${pick(adjectives)}-${pick(nouns)}-${digits()}`

export const LOCAL_PART_PATTERN = /^[a-z0-9][a-z0-9._-]{2,30}$/
```

---

## Storage Schema

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

Use `chrome.storage.local` — it works across Chrome and Firefox (WXT polyfills the namespace).

---

## Message Types (Background ↔ Popup ↔ Content)

```typescript
// Requests (Popup/Content → Background)
type RequestMessage =
  | { type: 'GET_STATE' }
  | { type: 'GENERATE_ADDRESS' }
  | { type: 'SET_ADDRESS'; localPart: string; domain: string }
  | { type: 'GET_EMAIL'; id: string }
  | { type: 'DELETE_EMAIL'; id: string }
  | { type: 'GET_CURRENT_ADDRESS' }  // Content script uses this
  | { type: 'CLEAR_BADGE' }

// Events (Background → Popup)
type EventMessage =
  | { type: 'STATE_UPDATE'; state: StorageSchema }
  | { type: 'NEW_EMAIL'; email: EmailSummary }
  | { type: 'EMAIL_EXPIRED'; id: string }
  | { type: 'CONNECTION_STATUS'; status: 'connected' | 'disconnected' | 'error' }
```

---

## Build Order (5 Steps)

Follow these sequentially. Each step builds on the previous.

### Step 1: Scaffold + Background Service Worker
- WXT project init with TypeScript + Preact
- Tailwind CSS 4 with Midnight Amber theme
- `utils/api.ts` — REST client
- `utils/addressGenerator.ts` — word lists + generator
- `utils/storage.ts` — chrome.storage.local wrapper
- `utils/messages.ts` — typed message definitions
- `background.ts` — API calls, context menu, storage management
- Placeholder popup (just "MeowMail Extension" text)
- Verify it loads in both Chrome and Firefox

### Step 2: Popup UI — Address Generation & Copy
- `AddressBar` — current address display, copy, new, edit
- `AddressHistory` — recent addresses list, switch, remove
- Popup ↔ background messaging wired up
- Midnight Amber theme applied to all components

### Step 3: Popup UI — Mini Inbox + Real-Time
- `utils/websocket.ts` — Phoenix Socket + Channel wrapper
- Background WebSocket connection management
- `EmailList` — email summaries, loading/empty states
- `StatusBadge` — connection indicator (green/yellow/red)
- Badge counter on extension icon

### Step 4: Email Detail + Content Script + Context Menu
- `EmailDetail` — subject, sender, body (text/HTML), attachments, delete
- `content.ts` — detect email inputs, show autofill icon, fill on click
- Context menu: right-click → "Fill with MeowMail address"
- Proper `input`/`change` event dispatch after autofill

### Step 5: Cross-Browser Polish + Store Submission
- Chrome + Firefox testing
- Extension icons (16, 32, 48, 128 PNG)
- Error handling, 429 handling, offline state
- Animations (email slide-in, copy confirmation)
- Store listing screenshots, descriptions, privacy policy link
- Chrome Web Store + Firefox AMO submission prep

---

## Code Quality Standards

### Structure & Organization
- One component per file. PascalCase filenames matching exports.
- Group by feature inside `entrypoints/popup/components/`.
- Keep components under ~100 lines — popups are small, components should be smaller.
- Custom hooks in `utils/` or `hooks/`, named `use*`.
- All state lives in the background service worker. Popup is a thin rendering layer.

### Preact Patterns
- Use `const` arrow functions: `const AddressBar = ({ address, onCopy }) => { ... }`
- Destructure props at signature — never `props.address`
- Use Preact's `useCallback` and `useMemo` where relevant
- No direct API calls from components — everything goes through background messaging

### Extension-Specific Patterns
- **Background ↔ Popup**: Use `chrome.runtime.sendMessage` for request/response. Use `chrome.runtime.onMessage` in background to handle.
- **Background → Popup push**: Use `chrome.runtime.sendMessage` wrapped in try/catch (popup might not be open).
- **Content Script ↔ Background**: Same messaging pattern. Content script NEVER accesses storage directly.
- **Service Worker lifecycle**: Chrome may terminate the service worker. Never rely on in-memory state — always read from `chrome.storage.local` on wake-up. Re-establish WebSocket when needed.
- **WXT auto-imports**: WXT provides `browser` (cross-browser polyfill) and `defineBackground`, `defineContentScript` helpers. Use them.

### Tailwind Usage
- Define CSS variables in `:root` matching the theme above
- Extend Tailwind config to reference them: `colors: { midnight: 'var(--color-midnight)', ... }`
- Use `@layer components` for repeated patterns (`.btn-amber`, `.card-surface`)
- No magic numbers — Tailwind scale only
- Dark-only — no `dark:` variants, the extension IS dark

### Naming
- Clear, intention-revealing names: `emailList` not `data`, `handleCopy` not `onClick`
- Booleans: `isLoading`, `hasAttachments`, `isConnected`
- Message types: SCREAMING_SNAKE_CASE for type literals: `'GET_STATE'`, `'NEW_EMAIL'`
- No commented-out code, no console.log in production

### What Clean Extension Code Does NOT Look Like
- No `any` types — type everything, especially messages
- No API calls from popup components — always via background
- No hardcoded URLs — all from config
- No `setTimeout` polling when WebSocket is available
- No `<all_urls>` in host_permissions — only `https://meowmail.in/*`
- No `eval()` or `innerHTML` in content scripts (CSP violation)
- No heavy dependencies (moment.js, lodash, etc.) — bundle size matters

---

## Popup UI Spec

### Dimensions
- **Width**: 380px (fixed)
- **Height**: 500px (max, scrollable content area)

### View 1: Main (Address + Inbox)
```
┌─────────────────────────────────┐
│ 🐱 MeowMail          [●] Live  │  ← Header + connection status
├─────────────────────────────────┤
│                                 │
│  swift-cat-342@meowmail.in      │  ← Current address (click to edit)
│  [📋 Copy]  [🔄 New]  [▾ Hist] │  ← Action buttons
│                                 │
├─────────────────────────────────┤
│  Inbox (2)                      │  ← Email count
│  ┌─────────────────────────────┐│
│  │ noreply@example.com         ││
│  │ Verify your email address   ││  ← Click to view
│  │ 2 min ago              📎  ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ hello@service.com           ││
│  │ Welcome to our platform!    ││
│  │ 5 min ago                   ││
│  └─────────────────────────────┘│
│  ─── Expires in 54 min ───     │
├─────────────────────────────────┤
│  Open full inbox ↗              │  ← Opens meowmail.in
└─────────────────────────────────┘
```

### View 2: Email Detail
```
┌─────────────────────────────────┐
│ ← Back                 🗑 Delete│
├─────────────────────────────────┤
│  Verify your email address      │  ← Subject
│  From: noreply@example.com      │
│  2 min ago · Expires in 58 min  │
├─────────────────────────────────┤
│                                 │
│  Your verification code is:     │
│  123456                         │  ← Email body
│  Click here to verify →         │
│                                 │
├─────────────────────────────────┤
│  📎 receipt.pdf (44 KB)  ⬇     │  ← Attachments
├─────────────────────────────────┤
│  Open in MeowMail ↗            │
└─────────────────────────────────┘
```

### View 3: Address History (dropdown)
```
┌─────────────────────────────────┐
│  Recent Addresses               │
│  brave-fox-217@meowmail.in   ✕  │
│  cozy-moon-891@meowmail.in   ✕  │
│  quiet-wren-456@meowmail.in  ✕  │
│  [Clear all]                    │
└─────────────────────────────────┘
```

### Content Script Overlay
```
┌──────────────────────────────────────┐
│ Email: [                    ] [🐱]   │  ← Cat icon near input
└──────────────────────────────────────┘
                                  │
                                  ▼ (on click)
                    ┌──────────────────────┐
                    │ 🐱 Fill with:        │
                    │ swift-cat-342        │
                    │   @meowmail.in       │
                    │ [Fill]  [New address] │
                    └──────────────────────┘
```

The content script overlay should use Shadow DOM to avoid CSS conflicts with the host page.

---

## Permissions (Minimal)

```json
{
  "permissions": ["activeTab", "storage", "contextMenus", "clipboardWrite"],
  "host_permissions": ["https://meowmail.in/*"]
}
```

No scary permissions. No `tabs`, no `webRequest`, no `<all_urls>` host permission. This speeds up store review.

---

## Cross-Browser Notes

| Chrome (MV3) | Firefox (MV2) | WXT Handling |
|-------------|---------------|-------------|
| Service Worker (non-persistent) | Background page (persistent) | WXT abstracts this |
| `chrome.action` | `browser.browserAction` | WXT polyfills |
| `chrome.storage` | `browser.storage` | WXT polyfills |
| WebSocket in SW: yes | WebSocket in BG: yes | Both work |

**Key concern**: Chrome may kill the service worker after ~30s of inactivity. Store state in `chrome.storage.local`, not in-memory variables. Re-establish WebSocket on wake-up.

---

## Parent Project Reference

The MeowMail web app lives at:
```
/Users/jay/Developer/meowmail/
```

Key files you can READ (not write) when needed:

| File | Path | Use |
|------|------|-----|
| Cat icon SVG | `/Users/jay/Developer/meowmail/frontend/public/favicon.svg` | Extension icon source |
| 16px icon | `/Users/jay/Developer/meowmail/frontend/public/favicon-16.png` | Use directly |
| 32px icon | `/Users/jay/Developer/meowmail/frontend/public/favicon-32.png` | Use directly |
| 192px icon | `/Users/jay/Developer/meowmail/frontend/public/favicon-192.png` | Resize to 128px |
| 512px icon | `/Users/jay/Developer/meowmail/frontend/public/favicon-512.png` | Hi-res source |
| Full theme CSS | `/Users/jay/Developer/meowmail/frontend/src/index.css` | Verify theme values |
| Address generator | `/Users/jay/Developer/meowmail/frontend/src/utils/addressGenerator.js` | Canonical word lists |
| API client | `/Users/jay/Developer/meowmail/frontend/src/api/client.js` | API pattern reference |
| Inbox API | `/Users/jay/Developer/meowmail/frontend/src/api/inbox.js` | Endpoint reference |
| Attachments API | `/Users/jay/Developer/meowmail/frontend/src/api/attachments.js` | Attachment URL pattern |
| WebSocket hook | `/Users/jay/Developer/meowmail/frontend/src/hooks/useInboxChannel.js` | Channel connection pattern |
| Config | `/Users/jay/Developer/meowmail/frontend/src/config.js` | URL patterns, regex |
| Product reference | `/Users/jay/Developer/meowmail/docs/PRODUCT_REFERENCE.md` | Branding, store copy |
| Extension plan | `/Users/jay/Developer/meowmail/docs/EXTENSION_PLAN.md` | Full build plan |
| Backend router | `/Users/jay/Developer/meowmail/lib/meowmail_web/router.ex` | API endpoint source of truth |

Use the `Read` tool with absolute paths to access these files.

---

## Config

```typescript
const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL ?? 'https://meowmail.in',
  WS_URL: import.meta.env.VITE_WS_URL ?? 'wss://meowmail.in/socket',
  DEFAULT_DOMAIN: 'meowmail.in',
  MAX_HISTORY: 10,
  BADGE_COLOR: '#f5a623',
  LOCAL_PART_PATTERN: /^[a-z0-9][a-z0-9._-]{2,30}$/,
}

export default CONFIG
```

No hardcoded URLs anywhere else. Import `CONFIG` wherever needed.

---

## Security Rules

- Content scripts must NOT use `innerHTML` or `eval()` (CSP violation in extensions)
- Use Shadow DOM for content script overlays to isolate from host page CSS
- `html_body` from the API is pre-sanitized server-side — but still render in sandboxed iframe in popup for extra isolation
- Never expose the current address in `document.title` or browser history
- Never send address data to any third party — only to `meowmail.in`
- Never request permissions beyond what's listed above
- Attachment downloads should open in a new tab pointing to the API download URL

---

## What NOT to Do

- Do NOT use React — use Preact. Bundle size matters in extensions.
- Do NOT make API calls from popup or content script — always go through background.
- Do NOT use `<all_urls>` host permission — only `https://meowmail.in/*`.
- Do NOT use inline styles — Tailwind utilities only.
- Do NOT hardcode `meowmail.in` anywhere except the config file.
- Do NOT use `setTimeout` for polling — use WebSocket for real-time updates.
- Do NOT store sensitive data in `chrome.storage.sync` — use `local` only.
- Do NOT create a light mode — the extension is dark-only.
- Do NOT use raw WebSocket — always use the `phoenix` npm package.
- Do NOT mutate the host page's DOM beyond the autofill icon and overlay (content script).
