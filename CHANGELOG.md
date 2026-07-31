# Changelog

All notable changes to `git-gimme`. Dates are release dates; versions follow
[semver](https://semver.org/).

## 0.2.0 — 2026-07-31

- **Breaking:** the exported function is now `gitGimme` (was `gitGet`); its option/result types are
  `GitGimmeOptions` / `GitGimmeResult`. The `git gimme` CLI is unchanged.
- `giget` moved from a dependency to a peer dependency (`>=3.3.0`), so an existing install is
  reused instead of a second copy being added.

## 0.1.0 — 2026-07-30

- Initial setup: `gitGet` (resolve shorthand/URL sources, wrap `giget`, handle single-file
  downloads and ambiguous shorthand) plus the `git gimme` CLI.
