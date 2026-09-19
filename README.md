# bohdan-domashenko

Personal site — Astro, static, no backend. Articles are Markdown in `src/content/posts/`.

## Write a post
Add `src/content/posts/<slug>.md`:

    ---
    title: Post title
    date: 2026-10-01
    excerpt: One or two sentences for the list.
    draft: false   # true = visible in dev only
    ---

    Markdown body…

## Commands
`npm run dev` · `npm run build` · `npm run check` · `npm test`

## Deploy
Push to `main`; GitHub Actions publishes to Pages. One-time: repo Settings → Pages → Source: GitHub Actions. The repo must be named `BohdanDomashenko.github.io`.

## Placeholders
GitHub/LinkedIn/Upwork URLs in `src/consts.ts` are still `#` — fill them in.
