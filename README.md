# git-get

<!-- README_HEAD:START -->

[![npm version](https://img.shields.io/npm/v/git-get)](https://www.npmjs.com/package/git-get)
[![types](https://img.shields.io/npm/types/git-get)](./src/index.ts)
[![CI](https://github.com/jayf0x/git-folder/actions/workflows/ci.yml/badge.svg)](https://github.com/jayf0x/git-folder/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/git-get)](./LICENSE)

<!-- README_HEAD:END -->

`git get <owner/repo|github-url> [dest]` — thin wrapper around [giget](https://github.com/unjs/giget)
that fixes the rough edges you hit downloading a single file or subfolder from GitHub.

Install once, globally, and `git get` works as a native subcommand (git dispatches unrecognized
commands to `git-<name>` on PATH — no shell config needed).

## What's new

<!-- WHATSNEW:START -->
| Version | Highlights |
| ------- | ---------- |
| `0.1.0` | Initial setup — `gitGet` / `git get` CLI, single-file + directory downloads |
<!-- WHATSNEW:END -->

Full history in [CHANGELOG.md](./CHANGELOG.md).

## What it fixes vs. plain giget

**Bare `owner/repo` doesn't mean what you'd expect.**
giget treats `owner/repo` as a *template registry* lookup, not a GitHub repo — it 404s unless you
know to prefix `github:`. git-get always resolves plain shorthand and pasted GitHub URLs straight
to the GitHub provider.

```
git get octocat/Hello-World          # giget: 404 (looks up registry template)
                                      # git-get: clones the repo
```

**Repos on `master` fail silently.**
giget hardcodes the ref to `"main"` when you don't specify one — any repo still on `master` (or
anything else) just 404s. git-get resolves the real default branch via the GitHub API first.

**No way to download a single file.**
giget's subdir matching only understands directories — pointing it at a file path matches zero tar
entries and silently extracts nothing. git-get detects this and fetches the file's parent dir,
filters down to the one file, and drops it at the destination.

```
git get octocat/Hello-World/README        # single file, lands as ./README
git get github.com/octocat/Hello-World/blob/master/README   # same, from a pasted URL
```

**Ambiguous paths just work.**
Given `owner/repo/some/path` with no way to know upfront if `path` is a file or a folder, git-get
tries directory mode first and falls back to file mode automatically — no separate flag or syntax
for either case.

## Install

```bash
npm install -g git-get   # or bun add -g / pnpm add -g
```

## Usage

```
git get <owner/repo | github-url> [dest] [--ignore=pattern,pattern]
```

- `owner/repo`, `owner/repo/sub/dir`, `owner/repo/sub/dir#ref` — shorthand
- full GitHub URLs: repo root, `/tree/<ref>/<path>`, `/blob/<ref>/<path>`
- `--ignore=*.mp4,*.lock` — comma-separated glob excludes, forwarded to giget

## API

```ts
import { gitGet } from 'git-get';
```

### `gitGet(input, options?)`

| Option   | Type     | Default | What it does                                                       |
| -------- | -------- | ------- | ------------------------------------------------------------------- |
| `dest`   | `string` | —       | Where to write the file/folder. Defaults to the repo or basename.    |
| `ignore` | `string` | —       | Comma-separated glob excludes, forwarded to giget.                   |

Returns `{ dir, files }` — the resolved output path and how many files landed there.

## Development

```bash
bun install
bun run test        # build, then bun test against dist/
bun run typecheck
bun run build       # vite → dist/
bun run format      # biome check --write
```

## License

[MIT](./LICENSE) © [jayF0x](https://github.com/jayf0x)
