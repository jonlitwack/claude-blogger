# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Blogger is a single-tenant Vercel template — a mobile-first publishing tool that lets users paste Markdown from AI conversations, hit publish, and commit to their GitHub repo. Each user deploys their own instance via "Deploy to Vercel".

See `PRODUCT.md` for full product spec.

## Build & Dev Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run lint         # run linter
```

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **NextAuth v4** — GitHub OAuth with `repo` scope (OAuth token replaces PAT)
- **Octokit** — GitHub API for reading/writing Markdown content
- **Vercel KV** (Redis) — stores user configuration (no SQL database)
- **Vercel** for hosting

## Architecture

### Auth Flow
- GitHub OAuth via NextAuth with `repo read:user user:email` scopes
- OAuth access token stored in JWT via `jwt` callback (`src/lib/auth.ts`)
- All Octokit calls use `session.accessToken` — no PAT env var needed
- Token also persisted in KV (`token:{username}`) for public page SSR/ISR

### Config Storage
- `src/lib/config.ts` — `BlogConfig` interface stored in Vercel KV, keyed by `config:{githubUsername}`
- Includes: owner, repo, branch, contentPath, imagePath, siteName, authorName, contentLabel, aboutBody
- Setup wizard (`/setup`) writes config on first run
- Public pages (Header, Footer, home, about, essays) read config from KV at render time

### Route Structure
- `src/app/(site)/` — Public site with Header + Footer layout (SSR/ISR, 60s revalidation)
- `src/app/write/` — Standalone editor (client-side, no site chrome, SessionProvider)
- `src/app/setup/` — Onboarding wizard (client-side, SessionProvider)
- `src/app/api/` — Protected API routes (all require NextAuth session)

### Key Files
- `src/lib/github.ts` — Octokit wrapper; every function takes `accessToken` + config params (owner, repo, contentPath)
- `src/lib/config.ts` — Vercel KV read/write for BlogConfig
- `src/lib/auth.ts` — NextAuth config with JWT callbacks
- `src/app/write/page.tsx` — The editor (paste zone, preview, formatting toolbar, publish)
- `src/app/setup/page.tsx` — Multi-step setup wizard (auth → repo picker → config form)
- `src/middleware.ts` — Protects /write, redirects to /setup if unconfigured

### Public Site Token
Public pages need a GitHub token for SSR/ISR since they're not behind auth. The setup wizard stores the OAuth token in KV at `token:{username}`. Pages retrieve it via `kv.get('token:...')` to make Octokit calls.

## Env Vars

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_SECRET` | Session encryption |
| `GITHUB_CLIENT_ID` | OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |
| `KV_REST_API_URL` | Vercel KV (auto-provisioned) |
| `KV_REST_API_TOKEN` | Vercel KV (auto-provisioned) |

## Design System

CSS variables in `src/app/globals.css`:
- `--night` (bg), `--ice` (headlines), `--muted` (body), `--rule` (borders), `--cyan` (accent)
- Fonts: Source Serif 4 (serif), IBM Plex Mono (mono)
- Editor has light mode toggle via `data-theme="light"` (persisted in localStorage)
- Public site is dark-only
