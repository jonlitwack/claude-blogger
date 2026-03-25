# Claude Blogger

## The Problem

People are writing with AI. Claude, ChatGPT, Gemini — millions of people are drafting blog posts, essays, and articles in chat every day. Then they hit a wall.

Getting that text from the chat window to a live blog post requires a chain of friction: copy to a text editor, format it, open a CMS or terminal, create a file, add metadata, commit, push, wait for a build. Or paste into WordPress/Medium and lose control of your content.

The people writing the best stuff with AI — designers, founders, domain experts, operators — are exactly the people least likely to have a CLI open. They're on their phones. They're between meetings. They wrote something worth publishing in a 10-minute conversation with Claude, and now it's trapped in a chat window.

## The Product

A mobile-first publishing tool for people who write with AI.

**The workflow:**
1. Write with Claude (or any AI) on your phone
2. Copy the Markdown
3. Open claudeblogger.com
4. Paste
5. Hit Publish
6. Live in 60 seconds

That's it. No git. No CLI. No build step. No CMS to learn.

## How It Works

- You connect your GitHub repo (one-time setup)
- Claude Blogger reads your existing Markdown content from the repo
- When you publish, it commits the file via the GitHub API
- Your static site (Vercel, Netlify, GitHub Pages) auto-deploys
- ISR or webhook-based revalidation makes it near-instant

Your content stays in your repo. You own it. Markdown files, version-controlled, portable. Claude Blogger is just the publishing UI — it doesn't host anything.

## The Editor

Dark mode by default. Matches the vibe of writing with AI at midnight.

- **Paste zone** — the primary input. Paste Markdown from any AI chat. Title auto-detected from the first H1 or frontmatter.
- **Editor** — clean textarea for tweaking. Not a WYSIWYG — you're editing Markdown. The people using this tool are comfortable with Markdown because they've been writing it with AI.
- **Preview** — toggle to see rendered HTML before publishing. Same typography as your site.
- **Formatting toolbar** — Lucide icons, wired up. Bold, italic, headings, quote, lists, link, image, code, rule. For quick edits, not primary authoring.
- **Light/dark mode** — toggle for preference. Persists.
- **Mobile-first** — designed for iPhone Safari. The formatting toolbar lives at the bottom, thumb-reachable.

## Who It's For

**Primary:** People who write blog posts with AI and publish to static sites.

- Designers who write about design (and built their site with Cursor/Claude)
- Founders who write company updates
- Developers who blog but don't want to open a terminal to publish
- Domain experts who've started writing with AI and want their own site

**Not for:** People who need a full CMS (content types, media libraries, workflows, teams). WordPress exists. This is the anti-WordPress.

## The Differentiator

Every other publishing tool assumes you're *writing* in the tool. Medium, Ghost, WordPress, Substack — they all have editors that compete with each other on formatting features.

Claude Blogger assumes you already wrote somewhere else. The AI chat *is* the editor. Claude Blogger is just the last mile — the bridge between "I wrote something good" and "it's live on my site."

Nobody else is building for this workflow because it didn't exist two years ago. Now it's how millions of people write.

## What Needs to Be Built

### MVP (extract from jonlitwack.com/write)

**Auth:**
- GitHub OAuth (sign in with GitHub)
- Each user connects their own repo
- Configuration: which repo, which directory (e.g., `content/posts/`), frontmatter template

**Editor:**
- Already built. Port from jonlitwack.com/write.
- Paste zone, editor, preview, formatting toolbar, light/dark mode
- Title auto-detection (frontmatter → H1)

**Publishing:**
- GitHub API via Octokit (already built)
- Configurable commit message template
- Configurable frontmatter fields (title, date, tags, draft status)

**Essay list:**
- Read from user's configured repo/path
- Show title, date, draft status
- Click to edit

**Landing page:**
- One page. The workflow diagram. A "Connect GitHub" button.
- Dark, minimal. The product's UI *is* the pitch.

### Post-MVP

- **Image upload** — paste or select images, upload to the repo or a CDN, insert Markdown reference
- **Draft/publish states** — save drafts that don't trigger deploys (e.g., save to a `_drafts/` directory)
- **Multiple sites** — connect more than one repo
- **Custom domains** — optional hosted blog for people who don't have a site yet
- **AI integration** — connect Claude API directly so you can write *and* publish without leaving the tool
- **Team support** — multiple editors on one site

## Tech Stack

- **Next.js** — same as the prototype
- **NextAuth** — GitHub OAuth
- **Octokit** — GitHub API
- **Vercel** — hosting
- **No database** — all content lives in the user's GitHub repo. User settings can be stored in Vercel KV or a simple JSON file in their repo.

## Name

"Claude Blogger" is a working name. Options:

- **Publish** — generic but clear
- **Pushdown** — Markdown + push
- **Inkwell** — writing metaphor
- **Draft** — simple, what you do
- **Quill** — writing tool (but a Markdown editor already uses this name)

The name should feel like a tool, not a platform. You don't "join" it. You use it.

## Business Model

**Free tier:** 1 repo, unlimited posts. The tool is useful enough to be free.

**Pro ($8/month):** Multiple repos, image upload, custom frontmatter templates, priority support.

The free tier is the growth engine. The pro tier is for people who use it seriously.

## What We Learned Building the Prototype

1. **Paste is the primary input.** Not typing, not file upload. Copy from Claude, paste, publish. Everything else is secondary.
2. **Title auto-detection matters.** Most AI-generated Markdown starts with an H1. Grab it automatically.
3. **Mobile is the platform.** The whole point is publishing from your phone. If the mobile UX isn't great, the product doesn't work.
4. **GitHub API is fast enough.** Commits via Octokit take <2 seconds. With ISR, the post is live in under a minute.
5. **Light mode is wanted.** Even on a dark-first product, people want a light option for writing in daylight.
6. **Preview matters.** People want to see the rendered output before committing. But they don't need WYSIWYG — they're comfortable with Markdown.
7. **No CMS complexity.** No content types, no media libraries, no user roles. One thing: Markdown files in a GitHub repo.

## The Pitch

*You wrote something good. Now publish it.*

Claude Blogger is the fastest way to go from AI chat to live blog post. Paste your Markdown, hit publish, it's live. Your content stays in your GitHub repo. You own everything.

No CMS. No terminal. No build step. Just write and publish.
