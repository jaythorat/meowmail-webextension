# MeowMail — Product Reference Guide

> **Purpose:** This document is the single source of truth for all product messaging, features, and positioning. Use it as a reference when writing blog posts, forum submissions, directory listings, social media content, guest articles, and any other marketing material.
>
> **Website:** [https://meowmail.in](https://meowmail.in)

---

## Table of Contents

1. [One-Liner & Elevator Pitch](#one-liner--elevator-pitch)
2. [What MeowMail Is](#what-meowmail-is)
3. [The Problem It Solves](#the-problem-it-solves)
4. [How It Works](#how-it-works)
5. [Core Features](#core-features)
6. [Use Cases](#use-cases)
7. [What NOT to Use It For](#what-not-to-use-it-for)
8. [Technical Differentiators](#technical-differentiators)
9. [Tech Stack](#tech-stack)
10. [Privacy & Security](#privacy--security)
11. [Competitive Positioning](#competitive-positioning)
12. [Frequently Asked Questions](#frequently-asked-questions)
13. [Target Keywords & SEO Angles](#target-keywords--seo-angles)
14. [Content Angles by Platform](#content-angles-by-platform)
15. [Screenshots & Visuals Guide](#screenshots--visuals-guide)
16. [Boilerplate Descriptions](#boilerplate-descriptions)
17. [Founder / Maker Story](#founder--maker-story)

---

## One-Liner & Elevator Pitch

**One-liner (under 80 chars):**
> MeowMail — Free disposable email. No signup. No tracking. Instant.

**Elevator pitch (30 seconds):**
> MeowMail is a free, privacy-first disposable email service. You generate a temporary inbox in one click — no account, no signup, no personal data. Emails arrive in real-time via WebSocket and auto-expire after 1 hour. Unlike most temp mail services that are bloated with ads and trackers, MeowMail runs its own SMTP server, uses zero cookies, and has a clean dark UI. It's built for anyone who's tired of handing out their real email to every website that asks.

**Product Hunt tagline:**
> Disposable email that just works. No signup. No tracking.

---

## What MeowMail Is

MeowMail is a **free, anonymous, temporary email service** (also known as disposable email, temp mail, or throwaway email).

It lets anyone:
- Generate a random temporary email address **instantly**
- Receive emails at that address in **real-time**
- View email content, HTML formatting, and attachments
- Walk away — the inbox **auto-expires and is permanently deleted**

There is no signup, no login, no account, and no personal data collected. Period.

**Category:** Privacy tools, email utilities, developer tools, security tools

---

## The Problem It Solves

### The Spam & Privacy Problem

Every time you enter your real email address on a website — to sign up for a service, download a resource, claim a free trial, join a newsletter, or register on a forum — you're creating a permanent link between your identity and that service. Here's what happens next:

1. **Spam:** Your address gets added to mailing lists. Some sites sell or share your data with third parties. You start receiving emails you never asked for.
2. **Data breaches:** That website gets hacked. Your email (along with potentially your password) ends up in leaked databases, sold on the dark web.
3. **Tracking:** Marketing platforms use your email to track you across services, build advertising profiles, and target you with personalized ads.
4. **Inbox clutter:** Promotional emails, newsletters you forgot about, and onboarding drip campaigns bury your important emails.
5. **Account fatigue:** You create throwaway accounts with your real email, then forget about them — but they persist, associated with your identity.

### MeowMail's Solution

Use a disposable email instead. Give out a temporary address, receive what you need (verification code, confirmation link, download), and let the inbox disappear forever. Your real email stays clean, private, and spam-free.

**Before MeowMail:** "Sign up with your email to continue" → spam forever.
**After MeowMail:** Generate a temp address → get verification → done. No trace.

---

## How It Works

MeowMail works in 4 simple steps:

### Step 1: Generate an Address
Visit [meowmail.in](https://meowmail.in). A random temporary email address is generated automatically (e.g., `swift-cat-342@meowmail.in`). You can also customize the address to anything you want.

### Step 2: Use It Anywhere
Copy the address and paste it wherever a website asks for your email — signups, verifications, free trials, newsletter subscriptions, forums, online shopping.

### Step 3: Receive Emails in Real-Time
Go to your inbox. Emails arrive instantly via WebSocket — no page refreshing needed. View full HTML emails, read text, download attachments.

### Step 4: Walk Away
After 1 hour, the inbox and all emails are permanently and automatically deleted from our servers. No trace, no archive, no recovery possible.

---

## Core Features

### Instant Inbox Generation
- One-click random address generation using memorable word-based names (e.g., `brave-fox-217@meowmail.in`)
- Customizable local part — edit the address to whatever you want
- No signup, no login, no account required
- Works immediately, zero setup time

### Real-Time Email Delivery
- Emails arrive instantly via WebSocket (Phoenix Channels)
- No polling, no page refreshing, no manual reload
- Toast notifications when new emails arrive
- Live connection status indicator

### Full Email Viewing
- HTML email rendering with full formatting preserved (tables, images, styles)
- Plaintext fallback for text-only emails
- Email metadata: sender, subject, timestamp, expiry countdown
- Sandboxed rendering for security

### Attachment Support
- View and download email attachments
- File type and size displayed for each attachment
- Up to 5 MB per attachment, 10 MB total per email

### Auto-Expiring Inboxes
- Emails auto-delete after 1 hour (configurable)
- Permanent deletion — no recovery, no archive, no backups
- Live expiry countdown badge on each email
- Expired emails are removed from UI in real-time

### Email Management
- Delete individual emails before expiry
- Paginated inbox for multiple emails
- Address history — remembers your recent addresses locally (in your browser, not our server)
- Quick return to your last-used inbox

### Privacy-First Design
- Zero cookies
- Zero tracking pixels or fingerprinting
- Zero personal data collection
- No Google Analytics — only cookieless Cloudflare Web Analytics (aggregate, privacy-friendly)
- No ads

### Clean, Modern UI
- Dark "Midnight Amber" theme — easy on the eyes
- Mobile-responsive design — works on any device
- Minimal, distraction-free interface
- Smooth animations and loading skeletons
- Cat-themed branding and error states

---

## Use Cases

### 1. Website Signups & Registrations
> "Sign up to read this article" / "Create an account to continue"

Use a temp email when forced to register on a site you'll only visit once. Get access without handing over your real identity.

### 2. Verification Codes & Confirmation Emails
Receive OTPs, email confirmation links, and account verification codes without exposing your real email. Perfect for one-time verifications.

### 3. Free Trial Signups
Testing a SaaS tool or online service? Use a disposable email to explore without committing your real inbox to promotional follow-ups and "your trial is expiring!" drip campaigns.

### 4. Newsletter Previews
Curious about a newsletter but not ready to commit? Subscribe with a temp email, preview a few editions, and decide if it's worth your real address.

### 5. Developer & QA Testing
Building an app that sends emails? Use MeowMail to test signup flows, password resets, notification emails, and transactional email formatting without creating real mailboxes.

### 6. Online Shopping & E-commerce
Buying from a one-off online store? Use a temp email for the order confirmation. Avoid weeks of "items you might like!" marketing emails.

### 7. Forum & Community Registrations
Posting a question on a forum or joining a one-time discussion? Temp email lets you participate without permanent inbox pollution.

### 8. Downloading Resources / Gated Content
PDFs, whitepapers, guides, and templates that require an email to download. Use MeowMail, get the content, and move on.

### 9. Contests & Giveaways
Enter a contest or giveaway without signing up for a lifetime of promotional emails.

### 10. Reducing Your Digital Footprint
Every real email you give out creates a permanent data point. MeowMail helps minimize the personal data you scatter across the internet.

---

## What NOT to Use It For

Be honest in all content — these caveats build trust:

- **Banking & financial services** — Use your real email for anything involving money
- **Social media accounts you want to keep** — You'll lose access when the inbox expires
- **Password resets** — If you need to recover an account later, a temp email won't work
- **Sensitive or confidential information** — Temp inboxes are publicly accessible by address
- **Two-factor authentication (2FA)** — Don't rely on a temporary email for ongoing 2FA
- **Long-term accounts** — Anything you need to access again in the future

---

## Technical Differentiators

These are the things that make MeowMail genuinely different from competitors — use these points when writing technical content:

### 1. Own SMTP Server
MeowMail runs its own complete SMTP server (built on Erlang's gen_smtp). We don't rely on third-party email providers or shared infrastructure. Emails are received, processed, and stored entirely on infrastructure we control.

### 2. Real-Time via WebSocket
Most temp mail services poll the server every few seconds. MeowMail uses Phoenix Channels (WebSocket) for true real-time delivery. When an email arrives at the SMTP server, it's processed and pushed to your browser in under a second.

### 3. Elixir/Erlang Backend
Built on Elixir and the BEAM VM — the same technology that powers WhatsApp and Discord. This means rock-solid concurrency, fault tolerance, and the ability to handle thousands of simultaneous connections efficiently. Individual email processing failures are isolated — one malformed email can't crash the system.

### 4. Asynchronous Processing Pipeline
The SMTP server accepts emails immediately (fast 250 OK response) and processes them asynchronously. This means senders never experience timeouts, and the email pipeline handles parsing, sanitization, storage, and real-time broadcast as separate stages.

### 5. ETS-Based Rate Limiting & Domain Validation
Hot-path operations (rate limiting, domain validation) use in-memory ETS tables — zero database lookups during SMTP connections. This keeps the server fast even under high load.

### 6. No External Dependencies for Core Flow
The entire email receive → parse → store → display pipeline uses zero external services. No SES, no SendGrid, no Mailgun, no Redis. Just PostgreSQL and the BEAM runtime.

---

## Tech Stack

Use this when writing technical blog posts or developer-focused content:

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Elixir + Phoenix | Fault-tolerant, concurrent, real-time channels built-in |
| **SMTP Server** | gen_smtp (Erlang) | Battle-tested SMTP implementation on the BEAM |
| **Database** | PostgreSQL | Reliable, supports TTL via timestamp-based cleanup |
| **HTTP Server** | Bandit | Modern, pure-Elixir HTTP/2 server |
| **Frontend** | React 19 + Vite | Fast dev experience, modern component model |
| **Styling** | Tailwind CSS 4 | Utility-first, responsive, no CSS bloat |
| **Real-Time** | Phoenix Channels (WebSocket) | Sub-second server-to-client push |
| **Rate Limiting** | Hammer (ETS-backed) | In-memory, zero-latency rate limiting |
| **Hosting** | Single EC2 instance + nginx | Simple, cost-efficient for MVP scale |

---

## Privacy & Security

### What We Don't Do
- **No accounts** — Nothing to create, nothing to hack
- **No cookies** — Zero. Not even "essential" cookies
- **No tracking** — No Google Analytics, no Facebook Pixel, no fingerprinting
- **No personal data** — We never ask for or store any personal information
- **No ads** — No advertising, no sponsored content, no data monetization
- **No email sending** — Receive-only. Can't be used for spam or phishing
- **No permanent storage** — Everything auto-deletes. No archives, no backups

### What We Do
- **STARTTLS encryption** — Emails are encrypted in transit (Gmail and major providers connect via TLS)
- **Rate limiting** — Per-IP limits on both SMTP and HTTP to prevent abuse
- **HTML sanitization** — Dangerous scripts/tags stripped, email rendered in sandboxed iframe
- **Relay prevention** — SMTP server only accepts mail for registered domains
- **Attachment safety** — Filename sanitization prevents path traversal attacks
- **Auto-expiry** — Emails are permanently deleted after 1 hour via automated cleanup
- **Cookieless analytics** — Only Cloudflare Web Analytics (aggregate stats, no individual tracking)

---

## Competitive Positioning

### MeowMail vs. Other Temp Mail Services

| Feature | MeowMail | Temp-Mail.org | Guerrilla Mail | 10MinuteMail | Mailinator |
|---------|----------|---------------|----------------|--------------|------------|
| Free | Yes | Yes | Yes | Yes | Freemium |
| No signup | Yes | Yes | Yes | Yes | Yes |
| Real-time (WebSocket) | Yes | No (polling) | No (polling) | No (polling) | No |
| Custom address | Yes | Limited | Yes | No | Paid |
| No ads | Yes | No (heavy ads) | No (ads) | No (ads) | No (ads) |
| No tracking | Yes | No (GA, trackers) | No | No | No |
| No cookies | Yes | No | No | No | No |
| Own SMTP server | Yes | Unknown | Yes | Unknown | Yes |
| Attachments | Yes | Yes | Yes | No | Paid |
| HTML email rendering | Full | Full | Basic | Basic | Full |
| Dark theme | Yes | No | No | No | No |
| Open infrastructure | Elixir/BEAM | Proprietary | Proprietary | Proprietary | Proprietary |
| Mobile responsive | Yes | Yes | Partial | Yes | Yes |

### Key Differentiators to Emphasize
1. **Zero ads** — Every competitor has ads. MeowMail doesn't.
2. **Zero tracking** — Most competitors use Google Analytics and various trackers. MeowMail uses nothing.
3. **Real-time delivery** — True WebSocket push, not periodic polling. Emails appear instantly.
4. **Clean UI** — No clutter, no popups, no banner ads. Just a beautiful dark-themed interface.
5. **Built on Elixir/BEAM** — Fault-tolerant, concurrent, modern infrastructure (interesting for dev audiences).

---

## Frequently Asked Questions

*(Use these as content blocks in articles, or adapt for specific platforms)*

**Q: What is MeowMail?**
A: MeowMail is a free disposable email service. Generate a temporary inbox instantly — no signup, no tracking, no accounts. Emails arrive in real-time and auto-expire after 1 hour.

**Q: Is MeowMail really free?**
A: Yes, completely. No premium tiers, no paid features, no hidden costs. Generate as many temporary inboxes as you need.

**Q: Do I need an account?**
A: No. No signup, no login, no personal information required. Just visit the site and get an address.

**Q: How long do emails last?**
A: Emails are automatically and permanently deleted after 1 hour. There is no way to recover expired emails.

**Q: Is it safe?**
A: Yes, for its intended purpose — signups, verifications, free trials, and one-time use. Don't use it for banking, sensitive accounts, or anything you need long-term access to. Inboxes are publicly accessible to anyone who knows the exact address.

**Q: Can I send emails?**
A: No. MeowMail is receive-only by design. This prevents misuse for spam or phishing.

**Q: Can I choose my own address?**
A: Yes. A random address is generated by default, but you can edit it to anything you want.

**Q: Does MeowMail track me?**
A: No. Zero cookies, zero Google Analytics, zero fingerprinting. We use only cookieless Cloudflare Web Analytics for aggregate traffic stats.

**Q: Can someone else see my inbox?**
A: Anyone who knows the exact email address can access that inbox. Addresses are randomly generated to be hard to guess, but treat temp inboxes as public — don't receive sensitive information.

**Q: Does it support attachments?**
A: Yes. You can view and download attachments up to 5 MB per file.

---

## Target Keywords & SEO Angles

### Primary Keywords (high volume)
- `temporary email`
- `disposable email`
- `temp mail`
- `throwaway email`
- `fake email`
- `temporary email address`
- `disposable email address`

### Secondary Keywords (medium volume)
- `anonymous email inbox`
- `no signup email`
- `temporary email address free`
- `disposable email service`
- `instant temporary email`
- `free temp mail`
- `temporary inbox`

### Long-Tail Keywords (low competition, easier to rank)
- `temporary email without registration`
- `free disposable email for signups`
- `privacy-friendly temp mail`
- `auto-expiring email inbox`
- `temporary email for verification`
- `disposable email no ads`
- `temp mail with attachments`
- `real-time temporary email`
- `disposable email with custom address`
- `best temp mail service 2026`
- `temp mail alternative to guerrilla mail`
- `how to avoid spam when signing up for websites`
- `temporary email vs email alias`
- `best disposable email services`
- `what is a throwaway email address`
- `protect email privacy online`

### Content Angles by Keyword
| Keyword Cluster | Content Angle |
|----------------|---------------|
| "temporary email" | What it is, how to use it, top services (list MeowMail) |
| "avoid spam" | Problem-focused: how temp email solves spam |
| "email privacy" | Privacy-focused: why your email is your identity |
| "developer testing" | Technical: using temp mail for QA and email testing |
| "disposable email vs alias" | Comparison: temp mail vs Firefox Relay vs iCloud+ vs plus-addressing |
| "best temp mail 2026" | Listicle: compare services, position MeowMail |

---

## Content Angles by Platform

### GeeksforGeeks (GFG)
**Best angle:** Technical tutorial / educational content
- "How to Build a Temporary Email Service: Architecture Overview"
- "Understanding SMTP Servers: How Disposable Email Works Behind the Scenes"
- "Elixir and gen_smtp: Building a Real-Time Email Pipeline"
- "WebSocket vs Polling: Real-Time Email Delivery Explained"
- "How Disposable Email Services Work — A Technical Deep Dive"

**Include:** Architecture diagrams, code concepts, SMTP flow explanation, link to MeowMail as a working example.

### Dev.to
**Best angle:** "I built this" / maker story / technical deep-dive
- "I Built a Disposable Email Service from Scratch — Here's What I Learned"
- "Why I Chose Elixir for a Real-Time Email Service (And What I'd Change)"
- "Building an SMTP Server That Handles 1000s of Concurrent Connections"
- "The Privacy Problem With Free Email Services"

**Include:** Personal narrative, technical challenges and solutions, screenshots, link to MeowMail.

### Reddit
**Best subreddits:** r/privacy, r/selfhosted, r/webdev, r/sideproject, r/elixir, r/InternetIsBeautiful
- r/privacy: "I built a disposable email service that uses zero cookies and zero trackers"
- r/selfhosted: "Open-architecture temp mail service built with Elixir + Phoenix"
- r/webdev: "How I built real-time email delivery with Phoenix Channels"
- r/sideproject: "MeowMail — free temp email with no ads, no tracking, no accounts"
- r/elixir: "Using gen_smtp and Phoenix Channels for a real-time email service"

**Tone:** Authentic, helpful, not promotional. Lead with the problem or the technical story.

### Hacker News (Show HN)
**Title:** "Show HN: MeowMail — Disposable email with real-time delivery, no ads, no tracking"
**Body:** Keep it short. What it is, why you built it, what's interesting technically (Elixir, gen_smtp, WebSocket, own SMTP server). Ask for feedback.

### Product Hunt
**Tagline:** "Disposable email that just works. No signup. No tracking."
**Description:** Focus on the zero-friction UX (one click to get an inbox), the privacy angle (no cookies, no tracking), and the technical edge (real-time WebSocket, own SMTP server).

### Twitter/X (@meowmail_in)
**Thread ideas:**
- "Why your email address is your most leaked piece of personal data" (thread)
- "I built a temp mail service. Here's why most temp mail sucks" (thread)
- "The anatomy of an SMTP connection: what happens when you receive email" (educational thread)
- Quick tips: "Next time a site asks for your email, use a disposable one instead"

### LinkedIn
**Best angle:** Professional / privacy / builder story
- "I built a privacy-first email tool. Here's what I learned about email infrastructure."
- "Why every developer should understand SMTP"
- "The hidden cost of giving out your work email to every SaaS vendor"

### Medium / Personal Blog
**Best for:** Long-form technical or opinion pieces
- "The Architecture Behind a Real-Time Disposable Email Service"
- "Email Privacy in 2026: Why Disposable Email Matters"
- "How We Handle Thousands of Emails Without Redis, Kafka, or Any Message Queue"
- "SMTP, STARTTLS, and Gmail: What I Learned Building an Email Server"

### Directory / Listing Sites
**AlternativeTo:** List as alternative to Guerrilla Mail, Temp-Mail, 10MinuteMail, Mailinator
**Product Hunt:** See above
**PrivacyGuides:** Privacy-focused tool, no tracking
**Awesome Lists (GitHub):** awesome-privacy, awesome-selfhosted

---

## Screenshots & Visuals Guide

When creating content, include screenshots of these key screens:

1. **Landing page** — Shows the address generator, clean dark UI, feature pills
2. **Inbox view** — Shows the email list with sender, subject, time, attachment indicators
3. **Email detail** — Shows full HTML email rendering, attachments, expiry badge
4. **Mobile view** — Responsive design, works on phone
5. **Real-time demo** — GIF/video showing an email arriving without page refresh
6. **Empty inbox state** — Shows the friendly empty state messaging
7. **Address customization** — Shows editing the local part of the email address

**OG Image:** Available at `/og-image.png` — dark background, MeowMail branding, tagline. Use for social sharing.

---

## Boilerplate Descriptions

### Ultra-Short (under 30 words)
> MeowMail is a free disposable email service. Generate a temporary inbox instantly — no signup, no tracking, no accounts. Emails arrive in real-time and auto-expire.

### Short (under 60 words)
> MeowMail is a free, privacy-first disposable email service. Generate a temporary email address in one click — no account, no signup, no cookies, no tracking. Emails arrive in real-time via WebSocket and automatically expire after 1 hour. Built on Elixir with its own SMTP server. No ads, no premium tier. Just a clean, fast temporary inbox.

### Medium (under 120 words)
> MeowMail is a free, anonymous temporary email service designed for people who care about privacy. Visit the site, generate a random email address (or customize your own), and start receiving emails instantly. No signup required. No account. No personal data collected.
>
> Emails arrive in real-time — powered by WebSocket technology, not slow polling. View full HTML emails, download attachments, and manage your inbox with a clean, ad-free dark interface. After 1 hour, the inbox and all emails are permanently deleted.
>
> MeowMail runs its own SMTP server built on Elixir and the BEAM VM. It uses zero cookies, zero Google Analytics, and zero tracking of any kind. It's free, and it always will be.

### Long (for directory listings, about pages, etc.)
> MeowMail is a free, privacy-first disposable email service that lets anyone create a temporary inbox in seconds. No signup, no login, no personal information — just visit meowmail.in, get an address, and start receiving emails.
>
> **The problem:** Every time you give your real email to a website, you risk spam, data breaches, tracking, and inbox clutter. Most sites don't need your real email — they just need an address to send a verification code or confirmation.
>
> **The solution:** Use a disposable email. MeowMail generates a random temporary address you can use anywhere. Emails arrive in real-time (WebSocket, not polling), you can view full HTML content and download attachments, and everything auto-deletes after 1 hour.
>
> **What makes MeowMail different:**
> - Zero ads — no banner ads, no popups, no sponsored content
> - Zero tracking — no cookies, no Google Analytics, no fingerprinting
> - Real-time delivery — emails arrive instantly, no manual refreshing
> - Custom addresses — edit your address to anything you want
> - Own SMTP infrastructure — we run our own email server, not a third-party service
> - Modern, clean UI — dark theme, mobile-responsive, no clutter
> - Built on Elixir/BEAM — the same fault-tolerant technology behind WhatsApp
>
> MeowMail is completely free with no premium tiers. Disposable email should be accessible to everyone.

---

## Founder / Maker Story

*(Adapt this for "I built this" posts on dev.to, Indie Hackers, Reddit, etc.)*

### The Origin
I was signing up for a service that demanded my email just to read an article. I used one of the popular temp mail services and was immediately hit with 3 banner ads, a popup, and a loading spinner while it polled the server for new emails. I thought: there has to be a better way.

### The Build
I built MeowMail from scratch — an SMTP server in Elixir using gen_smtp, a processing pipeline that handles email parsing and attachment extraction, a PostgreSQL backend with TTL-based expiry, a Phoenix API with WebSocket channels for real-time delivery, and a React frontend with a dark, minimal design.

### The Challenges
- Getting STARTTLS working with Gmail (Erlang SSL quirks with OTP 27)
- HTML email sanitization — you can't just strip all tags because marketing emails are 100% table-based
- iframe sandboxing for safe email rendering while allowing CSS to work
- Building a rate limiter that's fast enough for the SMTP hot path (ETS, not database)

### The Philosophy
Temp mail should be simple, fast, private, and free. No ads, no tracking, no premium upsell. MeowMail doesn't even use cookies. Your inbox exists for an hour, then it's gone forever. That's it.

---

## Quick Reference Card

| | |
|---|---|
| **Name** | MeowMail |
| **URL** | [https://meowmail.in](https://meowmail.in) |
| **Category** | Disposable email / Privacy tool |
| **Price** | Free (no premium tier) |
| **Signup required** | No |
| **Email direction** | Receive only |
| **Inbox lifetime** | 1 hour (auto-delete) |
| **Real-time** | Yes (WebSocket) |
| **Custom address** | Yes |
| **Attachments** | Yes (up to 5 MB) |
| **Cookies** | None |
| **Tracking** | None |
| **Ads** | None |
| **Backend** | Elixir + Phoenix + gen_smtp |
| **Frontend** | React + Vite + Tailwind CSS |
| **Domain** | @meowmail.in |
