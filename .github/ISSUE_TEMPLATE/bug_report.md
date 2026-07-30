---
name: Bug
about: Something broken in git-gimme
title: 'bug: <short description>'
labels: 'type:bug'
assignees: ''
---

## What's broken

<!-- One sentence. What fails? -->

## Domain

<!-- tick one -->

- [ ] `domain:parse` — source parsing (`src/parse-source.ts`)
- [ ] `domain:download` — giget wrapping / dir vs. file resolution (`src/index.ts`)
- [ ] `domain:cli` — argv parsing (`src/cli.ts`)

## Reproduce

```
git gimme <owner/repo|github-url> [dest]
```

## Expected vs actual

|          |     |
| -------- | --- |
| Expected |     |
| Actual   |     |

## Context

- Version:
- Node/Bun version:
