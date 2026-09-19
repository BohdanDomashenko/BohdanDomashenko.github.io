# Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Bohdan Domashenko's static personal site (Home/pagination, Post, Interesting, About, RSS) in Astro, matching the dark-minimal design.

**Architecture:** Astro static site, zero client JS. Posts are Markdown in a content collection; the "Interesting" list is a YAML collection. Small reusable `.astro` components with scoped CSS on top of a shared CSS-variable token file.

**Tech Stack:** Astro 5, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, TypeScript, `@fontsource` fonts, GitHub Actions → GitHub Pages. Node 24 locally (`node --test` for the one unit-tested util).

**Spec:** `docs/superpowers/specs/2026-09-19-personal-site-design.md` (see its "Amendments" section — it overrides the structure list where they differ).

## Global Constraints

- Dependencies limited to: `astro`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `@fontsource/instrument-serif`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`. No Tailwind, no UI kit, no client-side JS, no analytics.
- Tokens: bg `#0C0D10`, text `#EDEAE4`, body `#C6CAD2`, muted `#9EA4AE`, dim `#858B95`, rule `#1E212A`, surface `#131519`, accent `#D8A657`.
- Column widths: 720px (home, interesting), 680px (post, about). Under 640px: mobile layout (24px side padding).
- Site URL `https://bohdandomashenko.github.io`, no `base`.
- Email: `bogdandomashenko11@gmail.com`. Name: `Bohdan Domashenko`.
- 5 posts per page. `draft: true` posts excluded in production builds.
- Do not `git push` or add a remote; commit only after the user has OK'd committing.

---

## File map

| File | Responsibility |
|---|---|
| `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore` | Project config |
| `src/consts.ts` | Site name, nav, links, avatar path (single source) |
| `src/styles/global.css` | Tokens, reset, base typography |
| `src/styles/prose.css` | Markdown article styling |
| `src/layouts/BaseLayout.astro` | `<head>`, fonts, Header, column, Footer |
| `src/components/*.astro` | Header, Footer, PageIntro, PostMeta, PostListItem, Pagination, PostNav, LinkList, Pill, FactList |
| `src/lib/format.ts` (+ `.test.ts`) | `readTime`, `formatDate` (pure) |
| `src/lib/posts.ts` | `getPosts`, `PAGE_SIZE`, `Post` type |
| `src/content.config.ts` | Collections + schemas |
| `src/content/posts/*.md`, `src/content/reading/items.yaml` | Content |
| `src/pages/[...page].astro`, `posts/[slug].astro`, `interesting.astro`, `about.astro`, `404.astro`, `rss.xml.ts` | Routes |
| `public/favicon.svg`, `avatar.svg`, `robots.txt` | Static assets |
| `.github/workflows/deploy.yml` | Pages deploy |

---

### Task 1: Scaffold, tokens, layout shell

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/consts.ts`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/pages/index.astro` (temporary), `public/favicon.svg`, `public/robots.txt`

**Interfaces:**
- Produces: `SITE`, `NAV`, `LINKS`, `AVATAR`, `type NavKey` from `src/consts.ts`; `BaseLayout` props `{ title?: string; description?: string; narrow?: boolean; current?: NavKey; back?: { href: string; label: string } }`; `Header` props `{ current?: NavKey }`; `Footer` props `{ back?: { href: string; label: string } }`.

- [ ] **Step 1: Write config files**

`package.json`:
```json
{
  "name": "bohdan-domashenko",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "node --test src/lib/"
  }
}
```

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bohdandomashenko.github.io',
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": { "allowImportingTsExtensions": true, "noEmit": true }
}
```

`.gitignore`:
```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install astro @astrojs/rss @astrojs/sitemap @fontsource/instrument-serif @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
npm install -D @astrojs/check typescript
```
Expected: installs cleanly. Run `npx astro --version` and note the major version; if it is not 5.x, check the Astro upgrade guide for content-collection API changes (`glob`/`file` loaders, `render()` from `astro:content`) before continuing.

- [ ] **Step 3: Write `src/consts.ts`**

```ts
export const SITE = {
  name: 'Bohdan Domashenko',
  description:
    'Thoughts and notes on whatever I find important. Mostly engineering and AI.',
  url: 'https://bohdandomashenko.github.io',
};

export type NavKey = 'writing' | 'interesting' | 'about';

export const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: 'writing', label: 'Writing', href: '/' },
  { key: 'interesting', label: 'Interesting', href: '/interesting/' },
  { key: 'about', label: 'About', href: '/about/' },
];

export const LINKS = {
  email: { label: 'Email', href: 'mailto:bogdandomashenko11@gmail.com' },
  github: { label: 'GitHub', href: '#' },
  linkedin: { label: 'LinkedIn', href: '#' },
  upwork: { label: 'Upwork', href: '#' },
  rss: { label: 'RSS', href: '/rss.xml' },
};

/** Swap this path when you drop in a real photo (e.g. '/avatar.jpg'). */
export const AVATAR = '/avatar.svg';
```

- [ ] **Step 4: Write `src/styles/global.css`**

```css
:root {
  --bg: #0c0d10;
  --text: #edeae4;
  --body: #c6cad2;
  --muted: #9ea4ae;
  --dim: #858b95;
  --faint: #5c616b;
  --rule: #1e212a;
  --surface: #131519;
  --surface-2: #16181e;
  --border: #262a33;
  --accent: #d8a657;
  --serif: 'Instrument Serif', Georgia, serif;
  --sans: 'IBM Plex Sans', system-ui, sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, monospace;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
}

a { color: var(--text); text-decoration: none; }
a:hover { color: var(--accent); }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }

h1, h2, h3, p { margin: 0; }
```

- [ ] **Step 5: Write `Header.astro` and `Footer.astro`**

`src/components/Header.astro`:
```astro
---
import { SITE, NAV, type NavKey } from '../consts';

interface Props { current?: NavKey }
const { current } = Astro.props;
---
<header>
  <a class="brand" href="/">{SITE.name}</a>
  <nav aria-label="Main">
    {NAV.map((item) => (
      <a href={item.href} aria-current={item.key === current ? 'page' : undefined}>{item.label}</a>
    ))}
  </nav>
</header>

<style>
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .brand { font-family: var(--serif); font-size: 27px; letter-spacing: 0.01em; }
  nav { display: flex; gap: 30px; font-size: 15px; }
  nav a { color: var(--dim); }
  nav a:hover, nav a[aria-current='page'] { color: var(--accent); }
  @media (max-width: 640px) {
    header { flex-direction: column; align-items: flex-start; }
    .brand { font-size: 24px; }
    nav { gap: 20px; font-size: 14px; }
  }
</style>
```

`src/components/Footer.astro`:
```astro
---
import { SITE, LINKS } from '../consts';

interface Props { back?: { href: string; label: string } }
const { back } = Astro.props;
const links = [LINKS.rss, LINKS.github, LINKS.email];
---
<footer>
  {back ? <a class="dim" href={back.href}>{back.label}</a> : <span>© {new Date().getFullYear()} {SITE.name}</span>}
  <div class="links">
    {links.map((l) => <a href={l.href}>{l.label}</a>)}
  </div>
</footer>

<style>
  footer { display: flex; justify-content: space-between; align-items: center; padding-bottom: 44px; font-size: 13px; color: var(--dim); }
  .dim, .links a { color: var(--dim); }
  .dim:hover, .links a:hover { color: var(--accent); }
  .links { display: flex; gap: 22px; }
</style>
```

- [ ] **Step 6: Write `BaseLayout.astro`**

```astro
---
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { SITE, type NavKey } from '../consts';

interface Props {
  title?: string;
  description?: string;
  narrow?: boolean;
  current?: NavKey;
  back?: { href: string; label: string };
}
const { title, description = SITE.description, narrow = false, current, back } = Astro.props;
const fullTitle = title ? `${title} — ${SITE.name}` : SITE.name;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" type="application/rss+xml" title={SITE.name} href="/rss.xml" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta name="theme-color" content="#0C0D10" />
  </head>
  <body>
    <div class:list={['column', { narrow }]}>
      <Header current={current} />
      <main><slot /></main>
      <Footer back={back} />
    </div>
  </body>
</html>

<style is:global>
  .column {
    --col: 720px;
    width: 100%;
    max-width: calc(var(--col) + 48px);
    margin: 0 auto;
    padding: 72px 24px 0;
    display: flex;
    flex-direction: column;
    gap: 52px;
  }
  .column.narrow { --col: 680px; }
  main { display: flex; flex-direction: column; gap: 52px; }
  @media (max-width: 640px) {
    .column { padding-top: 30px; gap: 30px; }
    main { gap: 30px; }
  }
</style>
```

- [ ] **Step 7: Static assets and temporary index**

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0C0D10"/><text x="16" y="23" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="#D8A657">B</text></svg>
```
`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://bohdandomashenko.github.io/sitemap-index.xml
```
`src/pages/index.astro` (temporary, removed in Task 3):
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout current="writing"><p>Hello</p></BaseLayout>
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: succeeds, `dist/index.html` contains "Bohdan Domashenko" and "Hello".

- [ ] **Step 9: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: scaffold Astro site with tokens and layout shell"
```

---

### Task 2: Format utils (TDD), content collections, seed content

**Files:**
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/posts.ts`, `src/content.config.ts`, `src/content/posts/small-tools-that-outlive-their-purpose.md`, four more posts (below), `src/content/reading/items.yaml`

**Interfaces:**
- Produces: `readTime(markdown: string): string` (e.g. `'6 min'`), `formatDate(d: Date): string` (e.g. `'Sep 4, 2026'`), `PAGE_SIZE = 5`, `getPosts(): Promise<Post[]>` (newest first, drafts excluded in production), `type Post = CollectionEntry<'posts'>`; collections `posts` (`title`, `date`, `excerpt`, `draft`) and `reading` (`section: 'essays'|'talks'`, `title`, `source`, `url`, `note`).

- [ ] **Step 1: Write the failing test** — `src/lib/format.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTime, formatDate } from './format.ts';

test('readTime rounds words/200 with a 1 min floor', () => {
  assert.equal(readTime(''), '1 min');
  assert.equal(readTime('word '.repeat(50)), '1 min');
  assert.equal(readTime('word '.repeat(1200)), '6 min');
});

test('formatDate renders short month, day, year in UTC', () => {
  assert.equal(formatDate(new Date('2026-09-04')), 'Sep 4, 2026');
  assert.equal(formatDate(new Date('2026-06-30')), 'Jun 30, 2026');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./format.ts`.

- [ ] **Step 3: Implement** — `src/lib/format.ts`

```ts
export function readTime(markdown: string): string {
  const text = markdown.trim();
  const words = text ? text.split(/\s+/).length : 0;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: 2 tests pass.

- [ ] **Step 5: Collections and post helper**

`src/content.config.ts`:
```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

const reading = defineCollection({
  loader: file('src/content/reading/items.yaml'),
  schema: z.object({
    section: z.enum(['essays', 'talks']),
    title: z.string(),
    source: z.string(),
    url: z.string().url(),
    note: z.string(),
  }),
});

export const collections = { posts, reading };
```

`src/lib/posts.ts`:
```ts
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export const PAGE_SIZE = 5;

export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => !import.meta.env.PROD || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
```

- [ ] **Step 6: Seed posts**

`src/content/posts/small-tools-that-outlive-their-purpose.md`:
````markdown
---
title: On writing small tools that outlive their purpose
date: 2026-09-04
excerpt: Most scripts I write die the same afternoon. A few are still here years later, and they have almost nothing in common with what I would call good software.
---

Every so often I write a script that was meant to live for an afternoon. Something to rename a folder of files, or pull three numbers out of a log I only needed to read once. Most of them die the way they should. A few are still on my machine years later, and those are the ones I have started paying attention to.

The survivors have almost nothing in common with what I would call good software. They are short. They have no configuration. They do one thing to whatever you point them at, and then they print what they did. There is no install step, because there is nothing to install.

## What keeps a small tool alive

- It does one thing, and its name says which thing.
- It has no dependencies that need updating.
- It fails early and loudly, in a sentence a human can read.
- It can be read end to end in under a minute.

> A tool you can read in a minute is a tool you can still trust in a year.

Here is one of the oldest ones. It trims a video to the first thirty seconds so I can send it to someone without thinking about it. Four lines, written in 2019, never touched since:

```bash
#!/usr/bin/env bash
# usage: trim <file> [seconds]
set -euo pipefail
ffmpeg -i "$1" -t "${2:-30}" -c copy "trimmed_$1"
```

It is not clever and it is not safe in the ways a real program should be. But the cost of understanding it is zero, so the cost of fixing it when it breaks is close to zero too. That ratio is the whole thing. Most software gets harder to change as it gets older; a tool this size gets easier, because everything around it moves on and it simply does not.

So when I catch myself adding a flag, or a config file, or a second thing the script can do, I try to stop and write a second script instead. It is the only maintenance strategy I have that has worked for longer than a year.
````

Four more files, each `draft: true` (visible in `npm run dev`, excluded from production) with body `Draft — full text coming.`:

- `notes-from-rebuilding-my-note-system.md` — title `Notes from rebuilding my note system, again`, date `2026-08-21`, excerpt `Fourth rewrite in six years. This time I kept a log of every decision and the reason behind it, which turned out to be the only part worth keeping.`
- `the-case-for-boring-infrastructure.md` — title `The case for boring infrastructure`, date `2026-08-02`, excerpt `Every interesting piece of infrastructure I have run has cost me a weekend at some point. The dull parts have never once called me on a Saturday.`
- `reading-my-own-commit-history.md` — title `What I learned reading my own commit history`, date `2026-07-18`, excerpt `Two thousand commits, read end to end. The messages tell a clearer story about how I actually work than anything I would write about myself.`
- `slow-software.md` — title `Slow software`, date `2026-06-30`, excerpt `A short argument for programs that take their time on purpose, and a list of the few places where waiting is the feature rather than the bug.`

Front matter format for each:
```markdown
---
title: <title>
date: <date>
excerpt: <excerpt>
draft: true
---

Draft — full text coming.
```
(Wrap excerpts containing colons or quotes in double quotes.)

- [ ] **Step 7: Reading list** — `src/content/reading/items.yaml`

```yaml
- id: choose-boring-technology
  section: essays
  title: Choose Boring Technology
  source: Dan McKinley
  url: https://mcfunley.com/choose-boring-technology
  note: The innovation-tokens idea. I have quoted this in more design reviews than anything else on this page.
- id: worse-is-better
  section: essays
  title: The Rise of Worse is Better
  source: Richard Gabriel
  url: https://www.dreamsongs.com/RiseOfWorseIsBetter.html
  note: Forty years old and still the sharpest thing written about why the simpler, uglier design usually wins.
- id: ten-years
  section: essays
  title: Teach Yourself Programming in Ten Years
  source: Peter Norvig
  url: https://norvig.com/21-days.html
  note: A calm antidote to every twenty-one-day tutorial. Worth a re-read whenever you feel behind.
- id: website-obesity
  section: essays
  title: The Website Obesity Crisis
  source: Maciej Cegłowski
  url: https://idlewords.com/talks/website_obesity.htm
  note: Funny, mean, and correct about page weight. It changed how I build front ends more than any framework has.
- id: simple-made-easy
  section: talks
  title: Simple Made Easy
  source: Rich Hickey
  url: https://www.infoq.com/presentations/Simple-Made-Easy/
  note: The distinction between simple and easy, made so plainly that you cannot un-hear it afterwards.
- id: mother-of-all-demos
  section: talks
  title: The Mother of All Demos
  source: Douglas Engelbart
  url: https://www.youtube.com/watch?v=yJDv-zdhzMY
  note: 1968. Worth watching once a year to see how much of the future was already sitting on one desk.
```

- [ ] **Step 8: Verify content schema**

Run: `npm run build && npx astro check`
Expected: build passes (schema errors would fail it); `astro check` reports 0 errors.

- [ ] **Step 9: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: add format utils, content collections and seed content"
```

---

### Task 3: Home page with pagination

**Files:**
- Create: `src/components/PageIntro.astro`, `PostMeta.astro`, `PostListItem.astro`, `Pagination.astro`, `src/pages/[...page].astro`
- Delete: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getPosts`, `PAGE_SIZE`, `Post` (`src/lib/posts.ts`); `readTime`, `formatDate` (`src/lib/format.ts`).
- Produces: `PageIntro` props `{ title: string; lede?: string }` (title honours `\n` as a line break); `PostMeta` props `{ date: Date; read: string }`; `PostListItem` props `{ post: Post }` (links to `/posts/${post.id}/`); `Pagination` props `{ current: number; last: number }` (renders nothing when `last <= 1`; page 1 → `/`, page n → `/n/`).

- [ ] **Step 1: Write components**

`src/components/PageIntro.astro`:
```astro
---
interface Props { title: string; lede?: string }
const { title, lede } = Astro.props;
---
<div class="intro">
  <h1>{title}</h1>
  {lede && <p>{lede}</p>}
</div>

<style>
  .intro { display: flex; flex-direction: column; gap: 14px; }
  h1 { font-family: var(--serif); font-weight: 400; font-size: 44px; line-height: 1.15; letter-spacing: -0.01em; white-space: pre-line; }
  p { font-size: 15px; line-height: 1.75; color: var(--muted); max-width: 540px; }
  @media (max-width: 640px) { h1 { font-size: 30px; line-height: 1.18; } p { font-size: 14px; line-height: 1.7; } }
</style>
```

`src/components/PostMeta.astro`:
```astro
---
import { formatDate } from '../lib/format';

interface Props { date: Date; read: string }
const { date, read } = Astro.props;
---
<div class="meta">
  <time datetime={date.toISOString()}>{formatDate(date)}</time>
  <span class="sep" aria-hidden="true">/</span>
  <span>{read}</span>
</div>

<style>
  .meta { display: flex; gap: 10px; font-size: 12px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--dim); }
  .sep { color: #4f545d; }
  @media (max-width: 640px) { .meta { font-size: 11px; gap: 9px; } }
</style>
```

`src/components/PostListItem.astro`:
```astro
---
import PostMeta from './PostMeta.astro';
import { readTime } from '../lib/format';
import type { Post } from '../lib/posts';

interface Props { post: Post }
const { post } = Astro.props;
---
<article>
  <PostMeta date={post.data.date} read={readTime(post.body ?? '')} />
  <h2><a href={`/posts/${post.id}/`}>{post.data.title}</a></h2>
  <p>{post.data.excerpt}</p>
</article>

<style>
  article { display: flex; flex-direction: column; gap: 11px; padding: 30px 0; border-top: 1px solid var(--rule); }
  h2 { font-family: var(--serif); font-weight: 400; font-size: 30px; line-height: 1.25; }
  p { font-size: 15px; line-height: 1.75; color: var(--muted); }
  @media (max-width: 640px) { article { padding: 22px 0; gap: 8px; } h2 { font-size: 23px; line-height: 1.28; } p { font-size: 14px; line-height: 1.7; } }
</style>
```

`src/components/Pagination.astro`:
```astro
---
interface Props { current: number; last: number }
const { current, last } = Astro.props;
const url = (n: number) => (n === 1 ? '/' : `/${n}/`);
const pages = Array.from({ length: last }, (_, i) => i + 1);
---
{last > 1 && (
  <nav aria-label="Pagination">
    {current > 1 ? <a href={url(current - 1)}>← Newer</a> : <span class="off">← Newer</span>}
    <div class="pages">
      {pages.map((n) => <a href={url(n)} aria-current={n === current ? 'page' : undefined}>{n}</a>)}
    </div>
    {current < last ? <a href={url(current + 1)}>Older →</a> : <span class="off">Older →</span>}
  </nav>
)}

<style>
  nav { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--rule); padding-top: 22px; font-size: 14px; }
  .off { color: var(--faint); }
  .pages { display: flex; gap: 6px; }
  .pages a { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 10px; border: 1px solid transparent; color: var(--muted); }
  .pages a[aria-current='page'] { background: var(--surface-2); border-color: var(--accent); color: var(--text); }
  @media (max-width: 640px) { .pages { gap: 4px; } nav { padding-top: 16px; } }
</style>
```

- [ ] **Step 2: Write the page** (and delete the temporary index)

Run: `git rm -f src/pages/index.astro` (or `rm src/pages/index.astro` if not yet committed)

`src/pages/[...page].astro`:
```astro
---
import type { GetStaticPaths, Page } from 'astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import PageIntro from '../components/PageIntro.astro';
import PostListItem from '../components/PostListItem.astro';
import Pagination from '../components/Pagination.astro';
import { getPosts, PAGE_SIZE, type Post } from '../lib/posts';

export const getStaticPaths = (async ({ paginate }) => {
  return paginate(await getPosts(), { pageSize: PAGE_SIZE });
}) satisfies GetStaticPaths;

interface Props { page: Page<Post> }
const { page } = Astro.props;
---
<BaseLayout current="writing">
  {page.currentPage === 1 && (
    <PageIntro
      title={'Thoughts and notes on\nwhatever I find important.'}
      lede="Mostly engineering and AI — how systems are actually built, what the new tools change and what they only pretend to, and the ideas I want to keep."
    />
  )}
  <div>
    {page.data.map((post) => <PostListItem post={post} />)}
  </div>
  <Pagination current={page.currentPage} last={page.lastPage} />
</BaseLayout>
```

- [ ] **Step 3: Verify**

Run: `npm run build && npx astro check`
Expected: passes; `dist/index.html` lists 1 post (drafts excluded in prod). Then `npm run dev`, open the URL: 5 posts listed, no pagination (5 ≤ page size). To sanity-check pagination temporarily, set `PAGE_SIZE = 2`, confirm `/`, `/2/`, `/3/` exist with correct prev/next, then revert to 5.

- [ ] **Step 4: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: home page with paginated post list"
```

---

### Task 4: Post page

**Files:**
- Create: `src/styles/prose.css`, `src/components/PostNav.astro`, `src/pages/posts/[slug].astro`

**Interfaces:**
- Consumes: `getPosts`, `Post`, `readTime`, `PostMeta`, `BaseLayout` (`narrow`, `back`).
- Produces: `PostNav` props `{ newer?: Post; older?: Post }`; route `/posts/<post.id>/`.

- [ ] **Step 1: Prose styles** — `src/styles/prose.css`

```css
.prose { font-size: 18px; line-height: 1.8; color: var(--body); }
.prose > * + * { margin-top: 26px; }
.prose h2 { font-family: var(--serif); font-weight: 400; font-size: 28px; line-height: 1.3; color: var(--text); margin-top: 40px; }
.prose h3 { font-family: var(--serif); font-weight: 400; font-size: 22px; color: var(--text); margin-top: 32px; }
.prose a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.prose ul, .prose ol { padding-left: 22px; line-height: 1.7; }
.prose li + li { margin-top: 10px; }
.prose blockquote {
  margin-left: 0; margin-right: 0; padding: 4px 0 4px 26px;
  border-left: 2px solid var(--accent);
  font-family: var(--serif); font-style: italic; font-size: 25px; line-height: 1.45; color: var(--text);
}
.prose blockquote p { margin: 0; }
.prose :not(pre) > code { font-family: var(--mono); font-size: 0.88em; background: var(--surface); border: 1px solid var(--rule); border-radius: 6px; padding: 1px 6px; }
.prose pre {
  padding: 22px 24px; border: 1px solid var(--rule); border-radius: 12px; overflow-x: auto;
  font-family: var(--mono); font-size: 14px; line-height: 1.7;
  background: var(--surface) !important;
}
.prose img { max-width: 100%; border-radius: 12px; }
.prose hr { border: 0; border-top: 1px solid var(--rule); }
@media (max-width: 640px) {
  .prose { font-size: 16px; line-height: 1.75; }
  .prose h2 { font-size: 24px; }
  .prose blockquote { font-size: 21px; padding-left: 18px; }
  .prose pre { padding: 16px; font-size: 13px; }
}
```

- [ ] **Step 2: PostNav** — `src/components/PostNav.astro`

```astro
---
import type { Post } from '../lib/posts';

interface Props { newer?: Post; older?: Post }
const { newer, older } = Astro.props;
---
{(newer || older) && (
  <nav aria-label="More posts">
    {newer && (
      <a class="newer" href={`/posts/${newer.id}/`}>
        <span class="label">← Newer</span>
        <span class="title">{newer.data.title}</span>
      </a>
    )}
    {older && (
      <a class="older" href={`/posts/${older.id}/`}>
        <span class="label">Older →</span>
        <span class="title">{older.data.title}</span>
      </a>
    )}
  </nav>
)}

<style>
  nav { display: flex; justify-content: space-between; gap: 24px; border-top: 1px solid var(--rule); padding-top: 26px; }
  a { display: flex; flex-direction: column; gap: 6px; max-width: 280px; }
  .older { margin-left: auto; text-align: right; }
  .label { font-size: 12px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--dim); }
  .title { font-family: var(--serif); font-size: 19px; line-height: 1.35; }
  @media (max-width: 640px) { nav { flex-direction: column; } .older { margin-left: 0; text-align: left; } a { max-width: none; } }
</style>
```

- [ ] **Step 3: Post route** — `src/pages/posts/[slug].astro`

```astro
---
import { render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostMeta from '../../components/PostMeta.astro';
import PostNav from '../../components/PostNav.astro';
import { getPosts, type Post } from '../../lib/posts';
import { readTime } from '../../lib/format';
import '../../styles/prose.css';

export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.map((post, i) => ({
    params: { slug: post.id },
    props: { post, newer: posts[i - 1], older: posts[i + 1] },
  }));
}

interface Props { post: Post; newer?: Post; older?: Post }
const { post, newer, older } = Astro.props;
const { Content } = await render(post);
---
<BaseLayout
  title={post.data.title}
  description={post.data.excerpt}
  narrow
  current="writing"
  back={{ href: '/', label: '← All writing' }}
>
  <article>
    <header>
      <PostMeta date={post.data.date} read={readTime(post.body ?? '')} />
      <h1>{post.data.title}</h1>
    </header>
    <div class="prose"><Content /></div>
  </article>
  <PostNav newer={newer} older={older} />
</BaseLayout>

<style>
  article { display: flex; flex-direction: column; gap: 26px; }
  header { display: flex; flex-direction: column; gap: 16px; }
  h1 { font-family: var(--serif); font-weight: 400; font-size: 46px; line-height: 1.16; letter-spacing: -0.01em; }
  @media (max-width: 640px) { h1 { font-size: 32px; } }
</style>
```

- [ ] **Step 4: Verify**

Run: `npm run build && npx astro check`
Expected: `dist/posts/small-tools-that-outlive-their-purpose/index.html` exists and contains the blockquote and a `<pre` block. Run `npm run dev` and compare `/posts/small-tools-that-outlive-their-purpose/` with the Post board (list bullets, accent-bordered quote, code block, newer/older links at the bottom).

- [ ] **Step 5: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: post reading page with prose styles"
```

---

### Task 5: Interesting page

**Files:**
- Create: `src/components/LinkList.astro`, `src/pages/interesting.astro`

**Interfaces:**
- Consumes: `reading` collection, `PageIntro`.
- Produces: `LinkList` props `{ heading: string; items: { title: string; source: string; url: string; note: string }[] }`.

- [ ] **Step 1: LinkList** — `src/components/LinkList.astro`

```astro
---
interface Item { title: string; source: string; url: string; note: string }
interface Props { heading: string; items: Item[] }
const { heading, items } = Astro.props;
---
<section>
  <h2>{heading}</h2>
  {items.map((item) => (
    <a href={item.url} rel="noopener noreferrer" target="_blank">
      <span class="text">
        <span class="title">{item.title}</span>
        <span class="note">{item.note}</span>
      </span>
      <span class="source">{item.source}</span>
    </a>
  ))}
</section>

<style>
  section { display: flex; flex-direction: column; gap: 4px; }
  h2 { margin: 0 0 6px; font-size: 12px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); }
  a { display: flex; gap: 24px; align-items: baseline; padding: 18px 0; border-top: 1px solid var(--rule); }
  .text { display: flex; flex-direction: column; gap: 7px; flex-grow: 1; }
  .title { font-size: 17px; line-height: 1.35; }
  .note { font-size: 14px; line-height: 1.6; color: var(--muted); }
  .source { font-size: 12px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--dim); white-space: nowrap; }
  @media (max-width: 640px) { a { flex-direction: column; gap: 8px; } .source { order: -1; } }
</style>
```

- [ ] **Step 2: Page** — `src/pages/interesting.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PageIntro from '../components/PageIntro.astro';
import LinkList from '../components/LinkList.astro';

const items = (await getCollection('reading')).map((e) => e.data);
const by = (section: 'essays' | 'talks') => items.filter((i) => i.section === section);
---
<BaseLayout title="Interesting" current="interesting">
  <PageIntro
    title="Interesting"
    lede="Things I keep coming back to — essays, talks and a few tools. Not a link dump: something only lands here after I have re-read it at least once."
  />
  <LinkList heading="Essays" items={by('essays')} />
  <LinkList heading="Talks" items={by('talks')} />
</BaseLayout>
```

- [ ] **Step 3: Verify**

Run: `npm run build && npx astro check`
Expected: passes; `dist/interesting/index.html` contains all 4 essay and 2 talk titles. Compare with the Interesting board in dev.

- [ ] **Step 4: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: interesting reading list page"
```

---

### Task 6: About page

**Files:**
- Create: `src/components/Pill.astro`, `src/components/FactList.astro`, `src/pages/about.astro`, `public/avatar.svg`

**Interfaces:**
- Consumes: `LINKS`, `AVATAR` from `src/consts.ts`; `BaseLayout` (`narrow`).
- Produces: `Pill` props `{ href: string }` with label as default slot; `FactList` props `{ heading: string; facts: { label: string; value: string }[] }`.

- [ ] **Step 1: Placeholder avatar** — `public/avatar.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 148"><rect width="148" height="148" fill="#16181E"/><text x="74" y="92" text-anchor="middle" font-family="Georgia,serif" font-size="56" fill="#D8A657">BD</text></svg>
```

- [ ] **Step 2: Components**

`src/components/Pill.astro`:
```astro
---
interface Props { href: string }
const { href } = Astro.props;
---
<a href={href}><slot /></a>

<style>
  a { display: flex; align-items: center; height: 44px; padding: 0 20px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); font-size: 14px; }
  a:hover { border-color: var(--accent); }
</style>
```

`src/components/FactList.astro`:
```astro
---
interface Props { heading: string; facts: { label: string; value: string }[] }
const { heading, facts } = Astro.props;
---
<section>
  <h2>{heading}</h2>
  {facts.map((f) => (
    <div class="row">
      <span class="label">{f.label}</span>
      <span class="value">{f.value}</span>
    </div>
  ))}
</section>

<style>
  section { display: flex; flex-direction: column; gap: 4px; }
  h2 { margin: 0 0 10px; font-size: 12px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); }
  .row { display: flex; gap: 20px; align-items: baseline; padding: 13px 0; border-top: 1px solid var(--rule); }
  .label { width: 104px; flex-shrink: 0; font-size: 12px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--dim); }
  .value { font-size: 16px; line-height: 1.6; color: var(--body); }
  @media (max-width: 640px) { .row { flex-direction: column; gap: 4px; } }
</style>
```

- [ ] **Step 3: Page** — `src/pages/about.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Pill from '../components/Pill.astro';
import FactList from '../components/FactList.astro';
import { LINKS, AVATAR, SITE } from '../consts';

const facts = [
  { label: 'Work', value: 'Engineer at Geniusee' },
  { label: 'Focus', value: 'Backend and system design. AI and agentic workflows.' },
  { label: 'Studied', value: 'BSc Software Engineering, Zaporizhzhya National Technical University. Exchange in Engineering Science at KU Leuven.' },
  { label: 'Languages', value: 'Ukrainian (native), English (B2)' },
];
const elsewhere = [LINKS.email, LINKS.github, LINKS.linkedin, LINKS.upwork, LINKS.rss];
---
<BaseLayout title="About" narrow current="about">
  <div class="top">
    <div class="lead">
      <h1>About</h1>
      <p class="lede">I am Bohdan Domashenko. I work as an engineer at Geniusee, mostly on the backend. This is where I keep my notes.</p>
    </div>
    <img src={AVATAR} alt={SITE.name} width="148" height="148" />
  </div>

  <div class="text">
    <p>I have been building products for five years. Node.js and TypeScript, with Postgres, MongoDB and Redis behind them. React and Next.js when the work reaches the browser. What I like most is system design: how the data is modelled, where things get slow, what will be hard to change later.</p>
    <p>One thing I think about a lot right now is AI and agentic loops. Models take over more of the work every month. The question I care about is what the person does then — where judgment still belongs to a human, and how you stay in the loop instead of approving whatever comes out.</p>
    <p>The rest is plain engineering: architecture, databases, performance, the bugs that cost me a day. I keep the notes here as I work through it — what worked, what did not, what I would do differently. If the same things interest you, follow along.</p>
  </div>

  <FactList heading="At a glance" facts={facts} />

  <section class="elsewhere">
    <h2>Elsewhere</h2>
    <div class="pills">
      {elsewhere.map((l) => <Pill href={l.href}>{l.label}</Pill>)}
    </div>
  </section>

  <section class="colophon">
    <h2>Colophon</h2>
    <p>Posts are Markdown files in a Git repository. The site is static, built with Astro and hosted on GitHub Pages. Set in Instrument Serif and IBM Plex Sans. No analytics, no cookies. If you want to say something, use the email link above.</p>
  </section>
</BaseLayout>

<style>
  .top { display: flex; gap: 36px; align-items: flex-start; }
  .lead { display: flex; flex-direction: column; gap: 14px; flex-grow: 1; }
  h1 { font-family: var(--serif); font-weight: 400; font-size: 44px; line-height: 1.15; letter-spacing: -0.01em; }
  .lede { font-family: var(--serif); font-size: 23px; line-height: 1.5; color: var(--body); }
  img { flex-shrink: 0; border-radius: 18px; object-fit: cover; border: 1px solid var(--border); }
  .text { display: flex; flex-direction: column; gap: 20px; }
  .text p { font-size: 17px; line-height: 1.8; color: var(--body); }
  h2 { margin: 0; font-size: 12px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); }
  .elsewhere, .colophon { display: flex; flex-direction: column; gap: 16px; }
  .pills { display: flex; gap: 10px; flex-wrap: wrap; }
  .colophon p { font-size: 15px; line-height: 1.8; color: var(--muted); }
  @media (max-width: 640px) {
    .top { flex-direction: column-reverse; gap: 20px; }
    h1 { font-size: 32px; }
    .lede { font-size: 20px; }
    .text p { font-size: 16px; }
  }
</style>
```

- [ ] **Step 4: Verify**

Run: `npm run build && npx astro check`
Expected: passes; `dist/about/index.html` exists. Compare with the About board in dev.

- [ ] **Step 5: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: about page with fact list and link pills"
```

---

### Task 7: RSS, 404, and deploy workflow

**Files:**
- Create: `src/pages/rss.xml.ts`, `src/pages/404.astro`, `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: RSS** — `src/pages/rss.xml.ts`

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { SITE } from '../consts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: `/posts/${p.id}/`,
    })),
  });
}
```

- [ ] **Step 2: 404** — `src/pages/404.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageIntro from '../components/PageIntro.astro';
---
<BaseLayout title="Not found">
  <PageIntro title="Not found" lede="That page doesn't exist. Try the writing index." />
  <a href="/">← All writing</a>
</BaseLayout>
```

- [ ] **Step 3: Deploy workflow** — `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: README** — `README.md`

```markdown
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
GitHub/LinkedIn/Upwork URLs in `src/consts.ts`; replace `public/avatar.svg` and update `AVATAR` in `src/consts.ts`.
```

- [ ] **Step 5: Full verification**

Run: `npm test && npm run build && npx astro check`
Expected: 2 unit tests pass; build succeeds; `astro check` 0 errors; `dist/` contains `index.html`, `about/`, `interesting/`, `posts/small-tools-that-outlive-their-purpose/`, `rss.xml`, `sitemap-index.xml`, `404.html`. Run `npm run preview` and click through every nav link and the post → newer/older → back path; resize below 640px and compare with the Mobile board.

- [ ] **Step 6: Commit**

```bash
git add -A ':!.claude' && git commit -m "feat: RSS, 404 and GitHub Pages deploy"
```

---

## Self-review notes

- Spec coverage: structure, tokens, layout/mobile, drafts, read time, prose/Shiki, RSS, sitemap, deploy, placeholders, verification → Tasks 1–7. Amendments to the spec (root pagination route, 5 seeds with 4 drafts, avatar.svg, no "last updated" footer) are recorded in the spec's Amendments section.
- Names checked across tasks: `getPosts`, `PAGE_SIZE`, `Post`, `readTime`, `formatDate`, `NAV`, `LINKS`, `AVATAR`, `NavKey`, layout `back`/`narrow`/`current` are used consistently.
