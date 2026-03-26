# Claude Blogger

A mobile-first publishing tool that lets you paste Markdown from AI conversations and publish to your GitHub-powered blog. No CMS, no CLI, no build step.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjonlitwack%2Fclaude-blogger&env=NEXTAUTH_SECRET,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET&envDescription=GitHub%20OAuth%20credentials%20and%20auth%20secret.%20See%20README%20for%20setup%20instructions.&stores=%5B%7B%22type%22%3A%22kv%22%7D%5D)

## Setup

### 1. Create a GitHub OAuth App

1. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Fill in:
   - **Application name**: Claude Blogger (or anything you like)
   - **Homepage URL**: `https://your-site.vercel.app` (update after deploy)
   - **Authorization callback URL**: `https://your-site.vercel.app/api/auth/callback/github`
3. Click **Register application**
4. Copy the **Client ID**
5. Click **Generate a new client secret** and copy it

### 2. Deploy to Vercel

1. Click the **Deploy with Vercel** button above
2. When prompted for environment variables:
   - `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` and paste the result
   - `GITHUB_CLIENT_ID`: Paste from step 1
   - `GITHUB_CLIENT_SECRET`: Paste from step 1
3. Vercel will auto-provision a KV store for your configuration

### 3. Update the OAuth callback URL

After deploying, note your Vercel URL (e.g., `https://my-blog-xyz.vercel.app`).
Go back to your GitHub OAuth App settings and update the **Authorization callback URL** to:

```
https://your-actual-vercel-url.vercel.app/api/auth/callback/github
```

### 4. Run the setup wizard

Visit your deployed site. You'll be redirected to `/setup` where you can:
- Sign in with GitHub
- Select which repo holds your blog content
- Configure your site name, content path, and author info

## How it works

1. You paste Markdown (from Claude, ChatGPT, or anywhere) into the editor
2. Hit **Publish** — the app commits a `.md` file to your GitHub repo via the GitHub API
3. Your static site (Vercel, Netlify, GitHub Pages) auto-deploys from the commit
4. Essay is live within 60 seconds

## Architecture

- **Next.js** (App Router) — framework
- **NextAuth** — GitHub OAuth with `repo` scope (no PAT needed)
- **Octokit** — GitHub API for reading/writing content
- **Vercel KV** — stores site configuration
- **No database** — content lives in your GitHub repo

## Local development

```bash
cp .env.example .env.local
# Fill in your OAuth credentials
npm install
npm run dev
```
