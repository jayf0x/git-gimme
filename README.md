# git-gimme

<!-- README_HEAD:START -->

[![npm version](https://img.shields.io/npm/v/git-gimme)](https://www.npmjs.com/package/git-gimme)
[![types](https://img.shields.io/npm/types/git-gimme)](./src/index.ts)
[![CI](https://github.com/jayf0x/git-gimme/actions/workflows/ci.yml/badge.svg)](https://github.com/jayf0x/git-gimme/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/git-gimme)](./LICENSE)

<!-- README_HEAD:END -->

![Preview](./assets/preview.png)

> ༼ つ ◕_◕ ༽つ ⭐

`git gimme <owner/repo|github-url> [dest]` — thin wrapper around [giget](https://github.com/unjs/giget)
that fixes the rough edges you hit downloading a single file or subfolder from GitHub.

Install once, globally, and `git gimme` works as a native subcommand (git dispatches unrecognized
commands to `git-<name>` on PATH — no shell config needed).

## What's new

<!-- WHATSNEW:START -->

| Version | Highlights                                                                    |
| ------- | ----------------------------------------------------------------------------- |
| `0.1.0` | Initial setup — `gitGet` / `git gimme` CLI, single-file + directory downloads |

<!-- WHATSNEW:END -->

Full history in [CHANGELOG.md](./CHANGELOG.md).

## What it fixes vs. plain giget

**Bare `owner/repo` doesn't mean what you'd expect.**
giget treats `owner/repo` as a _template registry_ lookup, not a GitHub repo — it 404s unless you
know to prefix `github:`. git-gimme always resolves plain shorthand and pasted GitHub URLs straight
to the GitHub provider.

```
git gimme octocat/Hello-World        # giget: 404 (looks up registry template)
                                      # git-gimme: clones the repo
```

**Repos on `master` fail silently.**
giget hardcodes the ref to `"main"` when you don't specify one — any repo still on `master` (or
anything else) just 404s. git-gimme resolves the real default branch via the GitHub API first.

**No way to download a single file.**
giget's subdir matching only understands directories — pointing it at a file path matches zero tar
entries and silently extracts nothing. git-gimme detects this and fetches the file's parent dir,
filters down to the one file, and drops it at the destination.

```
git gimme octocat/Hello-World/README        # single file, lands as ./README
git gimme github.com/octocat/Hello-World/blob/master/README   # same, from a pasted URL
```

**Ambiguous paths just work.**
Given `owner/repo/some/path` with no way to know upfront if `path` is a file or a folder, git-gimme
tries directory mode first and falls back to file mode automatically — no separate flag or syntax
for either case.

## Install

```bash
npm install -g git-gimme   # or bun add -g / pnpm add -g
```

## Usage

```
git gimme <owner/repo | github-url> [dest] [--ignore=pattern,pattern]
```

- `owner/repo`, `owner/repo/sub/dir`, `owner/repo/sub/dir#ref` — shorthand
- full GitHub URLs: repo root, `/tree/<ref>/<path>`, `/blob/<ref>/<path>`
- `--ignore=*.mp4,*.lock` — comma-separated glob excludes, forwarded to giget

## API

```ts
import { gitGet } from "git-gimme";
```

### `gitGet(input, options?)`

| Option   | Type     | Default | What it does                                                      |
| -------- | -------- | ------- | ----------------------------------------------------------------- |
| `dest`   | `string` | —       | Where to write the file/folder. Defaults to the repo or basename. |
| `ignore` | `string` | —       | Comma-separated glob excludes, forwarded to giget.                |

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
