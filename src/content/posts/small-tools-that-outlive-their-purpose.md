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
