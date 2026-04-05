# Build Instructions

## Requirements

- **OS:** macOS, Linux, or Windows
- **Node.js:** v18 or later — https://nodejs.org/
- **npm:** v9 or later (included with Node.js)

## Steps to build

1. Install dependencies:

```
npm install
```

2. Build the Firefox extension:

```
npm run build:firefox
```

3. The built extension will be in `.output/firefox-mv2/`.

## Build tools used

- **WXT** (v0.20.20) — Browser extension framework, generates manifests for Chrome and Firefox
- **Vite** (via WXT) — Bundles and minifies JavaScript/CSS
- **TypeScript** — Source code is written in TypeScript, compiled to JavaScript during build
- **Tailwind CSS 4** — CSS utility framework, purges unused styles during build
- **Preact** — Lightweight UI library for the popup interface

All build tools are listed in `package.json` and installed automatically by `npm install`.
