---
name: MeowMail browser extension project
description: Building a Chrome + Firefox browser extension for MeowMail disposable email service using WXT + Preact + Tailwind
type: project
---

Building the MeowMail browser extension from scratch in the `meowmail-webextension` repo.

**What:** A Chrome (MV3) + Firefox (MV2) extension that brings MeowMail's disposable email into the browser — generate temp addresses, mini inbox with real-time WebSocket delivery, autofill email fields, context menu fill.

**Tech stack:** WXT framework, Preact (not React — bundle size), Tailwind CSS v4, Phoenix WebSocket (`phoenix` npm pkg), TypeScript, chrome.storage.local

**Theme:** Midnight Amber (dark-only) — must match the web app exactly using defined CSS variables.

**Build order (5 steps):**
1. ~~Scaffold + Background Service Worker~~ **DONE** (2026-04-04)
2. Popup UI — Address Generation & Copy **← NEXT**
3. Popup UI — Mini Inbox + Real-Time
4. Email Detail + Content Script + Context Menu
5. Cross-Browser Polish + Store Submission

**Current status:** Step 1 COMPLETE. Verified in Chrome — popup renders Midnight Amber theme, context menu works, background runs. Ready for Step 2.

**Step 1 delivered:**
- WXT project with Preact + Tailwind CSS v4 (no React)
- 6 utility files: types, config, addressGenerator, api, storage, messages
- Background service worker: message handler (7 types), context menu, on-install address generation, badge setup
- Placeholder popup: Midnight Amber themed, 380x500px
- Extension icons: 16, 32, 48, 128px (from parent project assets)
- Both Chrome MV3 (54KB) and Firefox MV2 (54KB) builds pass
- 0 TypeScript errors

**Key setup notes (for future reference):**
- WXT doesn't have a Preact template — initialized with vanilla, added Preact manually
- Import path for WXT storage: `wxt/utils/storage` (NOT `wxt/storage`)
- `srcDir: 'src'` in wxt.config.ts moves entrypoints into `src/entrypoints/`
- `@/*` path aliases auto-configured by WXT
- Background `main()` cannot be async — use `.then()` for async init
- Popup body needs explicit `width: 380px` or it collapses

**Parent project:** `/Users/jay/Developer/meowmail/` — read-only reference for assets, theme CSS, API patterns.

**API:** `https://meowmail.in` — REST + WebSocket (Phoenix Channels). No auth required. See `docs/API_REFERENCE.md` for full contract.
