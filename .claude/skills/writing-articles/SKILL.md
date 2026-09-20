---
name: writing-articles
description: Use when the user gives notes, bullet points, or a rough draft and wants an article, blog post, or post for this site, or asks to turn notes into a post in src/content/posts.
---

# Writing Articles

## Overview

Turn the user's notes into a post on this Astro site. The article is the user's notes, cleaner: same ideas, same opinions, same directness, in a better order with better grammar.

You are the editor. The user is the only author.

## Input

Notes pasted in the message, or a path to a notes file. Notes can be in any language or a mix. The article is always in English. Translate the meaning, not word by word.

## What the article is

- **Every sentence comes from the notes.** For each sentence you can point to the note line behind it. What you add yourself: connecting words, transitions, and grammar.
- **The main point comes first.** If the notes have a tl;dr or a conclusion, it goes in the first paragraph.
- **Length follows the notes.** About 100 words of notes gives a post of about 100–200 words. Short notes make a short post.
- **Clean notes stay almost the same.** If the notes already read as clear prose, keep the user's sentences and fix only grammar and awkward wording.
- **Doubt and numbers stay as written.** "some issue with sharp?" becomes "I think it was sharp", with no details added. "5-10x" stays "5-10x".
- **The last sentence comes from the notes**, like every other sentence. The post ends where the user's points end.

Anything else you want to add goes in the report under Suggestions, not in the article. This covers background explanations, links, examples, code samples, assumptions, and stronger openings or endings.

## Format

- No `#` heading in the body. The title comes from frontmatter.
- `##` headings only when the post is over about 300 words and has 3 or more clear parts.
- Bullets for things that are a list in the notes. Code blocks for code and commands. Inline code for identifiers. A blockquote only for an actual quote.
- Short paragraphs.

## File

Path: `src/content/posts/<title-in-kebab-case>.md`. If the file exists, ask before overwriting.

```markdown
---
title: <plain, sentence case; use the user's own phrasing when the notes have a title>
date: <today, YYYY-MM-DD>
excerpt: '<1–2 plain sentences made from the notes>'
draft: true
---
```

- `draft: true` on every new post, also when the user says "put it on my site" or "publish". Pushing to `main` deploys the site, so the user reads the post first and flips the flag.
- `excerpt` is always in single quotes. Write a `'` inside it as `''`. Quote `title` the same way if it has a `:` or starts with a quote.
- Run `npm run check` after writing the file. Leave git alone: no commit, no push.

## Report

After writing the file, reply with these four parts:

1. **File** – the path.
2. **Changes** – what you reordered, merged, or cut. A few bullets.
3. **Gaps** – places where a reader of the post would get stuck, or where you couldn't tell what a note means. Short questions to the user, most important first, 3 at most. For clear notes the answer is "None". The article keeps these places as vague as the notes do.
4. **Suggestions** – things the user could add to make the post better: explanations, links, examples, code, numbers. 5 at most.

## Writing style

Write in a simple, clear, natural, human way.

**General**

- Use B2-level English at most. Prefer common words over advanced vocabulary.
- Keep sentences relatively short and easy to scan.
- Sound like a real person, not a PR person, consultant, or corporate communications team.
- Be friendly and professional, but not overly formal.
- Be direct. Say the important thing first.
- Avoid unnecessary explanations, filler, and repetition.
- Keep the original meaning and intent. Do not change the message to make it sound more sophisticated.
- Do not make the text sound "perfect" or artificially polished. Slightly informal wording is fine if it feels more natural.
- Prefer concrete words over abstract business language.

**Tone:** casual + clear + professional + human. It should sound like something a competent engineer would write to a colleague.

Avoid corporate language, marketing language, exaggerated enthusiasm, unnecessary politeness, academic wording, motivational language, "AI-sounding" phrases, and long introductions.

**Sentence style**

| Prefer | Instead of |
|---|---|
| I think we should move this to a separate module. | I believe it would be beneficial for us to consider moving this functionality into a dedicated module. |
| This should be enough for now. | This should provide sufficient coverage for the current use case. |
| I'm not sure this is worth doing yet. | I'm not entirely convinced that this would provide sufficient value at this stage. |

**Engineering topics**

- Use technical terms when they are the normal terms developers use. Don't replace simple engineering language with corporate wording.
- Describe problems with facts, without drama.
- Natural phrases are fine: "I think…", "Maybe we can…", "I'm not sure…", "This looks like…", "The main issue is…", "One option is…".

**Editing the user's text**

1. Keep the original meaning.
2. Keep the same level of directness.
3. Fix grammar and awkward wording.
4. Make it sound more natural.
5. Remove unnecessary words.
6. Do not add ideas the user didn't express.
7. Do not make it more formal.
8. Preserve technical terminology when it is correct.

The goal is "sounds like me, but cleaner", not "sounds like a professional copywriter". If the text is already clear and natural, make only small changes. When in doubt, choose the simpler and more natural version.

## Common mistakes

| Mistake | Fix |
|---|---|
| Explaining background the notes don't mention (why Docker is slow on a Mac) | Put it in Suggestions |
| Filling a gap with a likely guess | Keep it vague in the article, ask in Gaps |
| Ending on your own summary line or aphorism | End on the user's last point |
| Moving the tl;dr to the end as a closer | Main point goes first |
| 100 words of notes turned into 400 words of post | Length follows the notes |
| Leaving `draft` out because the user said "put it on my site" | `draft: true`, always |
| Headings on a 150-word post | Plain paragraphs |
