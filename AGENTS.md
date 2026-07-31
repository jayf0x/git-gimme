# AGENTS.md

Working notes for agents/contributors on `git-gimme`.

## What this is

A `git gimme` subcommand: thin wrapper around [giget](https://github.com/unjs/giget) that resolves
plain `owner/repo` shorthand and pasted GitHub URLs to the real GitHub repo (not giget's template
registry), resolves the real default branch instead of assuming `main`, and adds single-file
downloads (giget only understands directories). Node/Bun only — no browser runtime.

## Mental model

- **`src/parse-source.ts`** — `parseSource` turns shorthand/URLs into `{ owner, repo, ref, subdir,
  hint }`; `buildGigetSource` turns that back into the `github:owner/repo/subdir#ref` string giget
  expects.
- **`src/index.ts`** — `gitGimme(input, options?)`: resolves the ref, then dispatches on `hint`
  (`dir` / `file` / `auto`). `auto` (ambiguous shorthand) tries directory mode first and falls back
  to file mode if nothing came down.
- **`src/cli.ts`** — argv parsing for the `git gimme` binary; built to `dist/cli.js` with a shebang
  banner (see `config/vite.config.ts`).

## Commands

```bash
bun install
bun run test        # build, then bun test — the e2e test runs the built dist/cli.js
bun run typecheck    # tsc --noEmit
bun run build        # vite lib build → dist/{index,cli}.js
bun run format        # biome check --write
```

## Conventions

- Tests exercise the built output (`dist/cli.js`), not `src/` — `pretest` builds first (see
  `package.json`). `tests/e2e.test.ts` spawns real network requests against
  `jayf0x/git-gimme/tests/fixtures/`.
- Biome for format/lint (`biome.json` → `config/biome.json`). TS strict. `config/opengrep/` holds
  vendored security-scan rules (`scripts/opengrep-scan.sh`, scans `src/` only).
- `config/vite.config.ts` builds two entries (`index`, `cli`) and externalizes `giget` + `node:*`.
- `giget` is a **peer** dependency (`>=3.3.0` — `ignore` landed in 3.3.0) and stays external in the
  build, so an already-installed giget is what gets loaded at runtime. Keep it out of
  `dependencies`.
