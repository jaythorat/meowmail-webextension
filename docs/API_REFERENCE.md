# MeowMail Backend API Reference

> This document is the source of truth for all frontend ↔ backend communication.
> All interaction is over HTTP/WebSocket only — no shared code, no shared state.

---

## Base URL

```
http://localhost:4000
```

All REST endpoints are prefixed with `/api`.
WebSocket endpoint is at `/socket`.

---

## Global Behavior

- All responses are `Content-Type: application/json` (except binary attachment downloads)
- All requests must include `Accept: application/json`
- No authentication required — anonymous access only (Phase 1 MVP)
- Rate limit: **100 requests/min per IP** — exceeding returns `429`
- CORS origin allowed: `http://localhost:3000` (configurable per environment)

---

## Endpoints

### Health Check

```
GET /api/health
```

**Response `200`:**
```json
{
  "status": "ok",
  "db": "connected",
  "smtp": "running"
}
```

| Field | Values |
|-------|--------|
| `status` | `"ok"` |
| `db` | `"connected"` \| `"disconnected"` |
| `smtp` | `"running"` \| `"stopped"` |

---

### List Available Domains

```
GET /api/domains
```

Returns all active domains users can create inboxes on.

**Response `200`:**
```json
{
  "domains": [
    { "name": "meowmail.dev" },
    { "name": "catpost.io" }
  ]
}
```

Use this to populate a domain picker in the UI. Users combine a local part + domain to form their inbox address (`local@domain`).

---

### Get Inbox (List Emails)

```
GET /api/inbox/:domain/:local_part
```

Fetches email summaries for a given inbox. The inbox is identified by splitting the email address:
- `user@meowmail.dev` → `domain=meowmail.dev`, `local_part=user`

The inbox is created implicitly — no registration needed. Fetching a non-existent inbox returns an empty list.

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `domain` | Domain portion of the email address |
| `local_part` | Local portion (before `@`) |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `before` | string (optional) | Pagination cursor — email ID to fetch results before |

**Response `200`:**
```json
{
  "emails": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sender": "noreply@github.com",
      "subject": "Your verification code is 482910",
      "received_at": "2026-03-31T10:42:00Z",
      "has_attachments": false
    }
  ]
}
```

**Response `404`** — domain does not exist in the system:
```json
{
  "errors": { "detail": "Not Found" }
}
```

---

### Get Email Detail

```
GET /api/emails/:id
```

Returns full email content including body. HTML body is **sanitized server-side** (XSS-safe) — safe to render directly in an iframe or innerHTML.

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Email UUID |

**Response `200`:**
```json
{
  "email": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "noreply@github.com",
    "subject": "Your verification code is 482910",
    "text_body": "Your code is 482910. It expires in 10 minutes.",
    "html_body": "<p>Your code is <strong>482910</strong>.</p>",
    "has_attachments": false,
    "received_at": "2026-03-31T10:42:00Z",
    "expires_at": "2026-04-07T10:42:00Z"
  }
}
```

| Field | Notes |
|-------|-------|
| `text_body` | May be `null` if email has no plain-text part |
| `html_body` | May be `null` if email has no HTML part. **Already sanitized** — safe to render |
| `expires_at` | ISO8601 — email auto-deletes after this time |

**Response `404`:**
```json
{
  "errors": { "detail": "Not Found" }
}
```

---

### List Attachments

```
GET /api/emails/:id/attachments
```

**Response `200`:**
```json
{
  "attachments": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "filename": "invoice.pdf",
      "content_type": "application/pdf",
      "size_bytes": 204800
    }
  ]
}
```

**Response `404`** — email not found.

---

### Download Attachment

```
GET /api/emails/:id/attachments/:attachment_id
```

Returns raw binary file data — not JSON.

**Response `200`:**
- `Content-Type`: from attachment metadata (e.g. `application/pdf`, `image/png`)
- `Content-Disposition`: `attachment; filename="invoice.pdf"` (filename is sanitized server-side)
- Body: raw binary

**Response `404`** — email or attachment not found.

> For download links in the UI, construct the URL directly and use an `<a href="..." download>` tag or `window.open()`. Do not fetch this as JSON.

---

### Delete Email

```
DELETE /api/emails/:id
```

Permanently deletes an email. Irreversible.

**Response `204`:** No body.

**Response `404`:**
```json
{
  "errors": { "detail": "Not Found" }
}
```

---

## Error Responses

All error responses follow the same envelope:

```json
{
  "errors": { "detail": "<message>" }
}
```

| Status | Meaning |
|--------|---------|
| `404` | Resource not found |
| `429` | Rate limit exceeded — back off and retry |
| `500` | Internal server error |

**Rate limit response `429`:**
```json
{
  "error": "rate limit exceeded"
}
```

---

## WebSocket — Real-Time Inbox Updates

The backend uses **Phoenix Channels** over WebSocket. The frontend must use the `phoenix` JS library (or equivalent) to connect — raw WebSocket won't work with the Phoenix framing protocol.

### Connection

```
Raw WebSocket / wscat: ws://localhost:4000/socket/websocket
Phoenix JS library:    new Socket("ws://localhost:4000/socket")
```

> **Note:** The Phoenix JS `Socket` class automatically appends `/websocket` to the URL you provide. Pass the base socket path (`/socket`), not the full transport URL.

### Joining an Inbox Channel

After connecting, join a topic to subscribe to a specific inbox:

```
Topic: "inbox:{local_part}@{domain}"
Example: "inbox:jay@meowmail.dev"
```

No payload needed on join. Server responds with `{status: "ok"}`.

### Events Received

**`new_email`** — a new email arrived in this inbox:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sender": "noreply@github.com",
  "subject": "Your code is 482910",
  "received_at": "2026-03-31T10:42:00Z",
  "has_attachments": false
}
```

**`email_expired`** — an email was auto-deleted by TTL:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Recommended Frontend Behavior

1. On inbox page load → connect to socket + join `inbox:local@domain`
2. On `new_email` → prepend to the email list in UI
3. On `email_expired` → remove the email from the list by ID
4. On disconnect/reconnect → re-fetch inbox via REST to catch up on missed events

---

## Typical Frontend Flow

```
1. GET /api/domains
   → Show domain picker

2. User picks local_part + domain
   → Address = local_part@domain

3. GET /api/inbox/:domain/:local_part
   → Render inbox list

4. WS: join "inbox:local_part@domain"
   → Listen for new_email / email_expired events

5. User clicks email
   → GET /api/emails/:id
   → Render email detail (html_body is safe to render directly)

6. Email has attachments?
   → GET /api/emails/:id/attachments
   → Render list; link each to GET /api/emails/:id/attachments/:attachment_id

7. User deletes email
   → DELETE /api/emails/:id
   → Remove from UI
```

---

## Security Notes for Frontend

- `html_body` is sanitized by the server (`HtmlSanitizeEx.basic_html`). Scripts, iframes, and event handlers are stripped. Safe to render but prefer sandboxed iframe for extra isolation.
- Attachment filenames are sanitized by the server — still validate/display defensively.
- No auth tokens, cookies, or session state are used. All access is anonymous by design.
- Do not expose the full inbox address in page titles or meta tags unnecessarily — treat it as a semi-secret token.
