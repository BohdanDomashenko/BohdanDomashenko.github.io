# Personal site — design spec

Static personal site for Bohdan Domashenko. Astro, no backend, no client JS. Articles are Markdown files in this repo. Visual design: Claude design artifact "Personal blog — dark minimal" (Home, Post, Interesting, About, Mobile boards).

## Goals
- Lightweight: `astro`, `@astrojs/rss`, `@astrojs/sitemap`, `@fontsource` fonts. Nothing else.
- Reusable components; no Tailwind, no UI kit.
- Content in git: posts as `.md`, "Interesting" list as YAML.

## Structure
```
src/
  content.config.ts         # posts (md, Zod) + reading (yaml, Zod)
  content/posts/*.md        # front matter: title, date, excerpt, draft?
  content/reading/items.yaml  # sections Essays/Talks; items {title, source, url, note}
  layouts/BaseLayout.astro  # <head>, Header, <slot/>, Footer
  components/
    Header, Footer, PageIntro (h1 + lede), PostMeta (date / read time),
    PostListItem, Pagination, PostNav (newer/older), LinkList, Pill, FactList
  pages/
    index.astro, page/[page].astro   # 5 posts per page
    posts/[...slug].astro
    interesting.astro, about.astro, 404.astro, rss.xml.js
  styles/global.css         # tokens, base, .prose
public/  favicon, avatar.jpg (user supplies; placeholder until then)
```

## Design tokens (CSS variables)
bg `#0C0D10`, text `#EDEAE4`, body `#C6CAD2`, muted `#9EA4AE`, dim `#858B95`, rule `#1E212A`, surface `#131519`, accent `#D8A657`.
Fonts (self-hosted via @fontsource): Instrument Serif, IBM Plex Sans, IBM Plex Mono.

## Layout
Single centered column: 720px (home, interesting), 680px (post, about). Under ~640px: 24px side padding, smaller type (per Mobile board). Nav: Writing / Interesting / About; current section in accent.

## Behavior
- Posts sorted by date desc; `draft: true` excluded from production builds.
- Read time computed at build from word count.
- Newer/Older links derived from sorted list.
- `.prose` styles h2, lists, blockquote (accent border), code (Shiki dark theme).
- RSS at `/rss.xml`; sitemap enabled.
- 3 seed posts from mockup copy; "small tools" post written in full.

## Deploy
GitHub Actions builds on push to `main`, publishes to GitHub Pages. Repo to be renamed `BohdanDomashenko.github.io` (root-served user site): `site: 'https://bohdandomashenko.github.io'`, no `base`.

## Placeholders to fill
GitHub / LinkedIn / Upwork URLs (`#`), avatar image. Email `bogdandomashenko11@gmail.com`. Colophon: Astro + GitHub Pages.

## Verification
`astro check` and `astro build` clean; built pages compared to design boards. No test framework.

## Amendments (from planning)
- Home + pagination live in a single `src/pages/[...page].astro` (routes `/`, `/2/`, …); no separate `index.astro` / `page/[page].astro`.
- Shared constants in `src/consts.ts`; pure helpers in `src/lib/format.ts` (unit-tested with built-in `node --test`) and `src/lib/posts.ts`.
- 5 seed posts: the "small tools" post in full; the other four are `draft: true` placeholders (visible in dev, excluded from production).
- Avatar placeholder is `public/avatar.svg`; swap the file and the `AVATAR` constant.
- The Interesting page uses the default footer (no "Last updated" line).
