# git-gimme

<!-- README_HEAD:START -->

[![npm version](https://img.shields.io/npm/v/git-gimme)](https://www.npmjs.com/package/git-gimme)
[![types](https://img.shields.io/npm/types/git-gimme)](./src/index.ts)
[![CI](https://github.com/jayf0x/git-gimme/actions/workflows/ci.yml/badge.svg)](https://github.com/jayf0x/git-gimme/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/git-gimme)](./LICENSE)

<!-- README_HEAD:END -->

![Preview](./assets/preview.png)

> (っᵔ◡ᵔ)っ ⭐

Ever wanted to download a **single file** or **single folder** from a Github repo?

```sh
git gimme unjs/giget/templates
git gimme unjs/giget/README.md
```

## Install

```sh
npm install -g git-gimme
```

Installed globally, `git gimme` works as a native git subcommand.

## What's new

<!-- WHATSNEW:START -->
| Version | Highlights |
| ------- | ---------- |
| `1.0.0` | Download single files from GitHub without cloning entire repositories |
| `0.2.0` | Exported function renamed to `gitGimme`; `giget` is now a peer dep |
| `0.1.0` | Initial release — `git gimme` CLI, single-file + folder downloads  |
<!-- WHATSNEW:END -->

Full history in [CHANGELOG.md](./CHANGELOG.md).

## Usage

```
git gimme <source> [dest] [--ignore='pattern,pattern']
```

### A folder

Lands as `./templates`:

```bash
git gimme unjs/giget/templates
```

### A single file

Lands as `./README.md`:

```bash
git gimme unjs/giget/README.md
```

If the path could be either, git-gimme tries folder first and falls back to file.

### A pasted GitHub URL

Both `/tree/` and `/blob/` links work as they are:

```bash
git gimme https://github.com/unjs/giget/tree/main/templates
git gimme https://github.com/unjs/giget/blob/main/README.md
```

### A branch, tag, or commit

```bash
git gimme 'unjs/giget/templates#v3.2.0'
```

Without a `#ref`, the repository's actual default branch is used.

### Somewhere other than the current folder

```bash
git gimme unjs/giget/templates ./vendor/templates
```

### Skipping files

```bash
git gimme unjs/giget ./giget --ignore='*.md,*.lock'
```

## API

```ts
import { gitGimme } from "git-gimme";

const { dir, files } = await gitGimme("unjs/giget/templates", {
  dest: "./vendor/templates",
  ignore: "*.md",
});

console.log(`${files} file(s) in ${dir}`);
```

`gitGimme(input, options?)`

| Option   | Type     | Default             | Description                        |
| -------- | -------- | ------------------- | ---------------------------------- |
| `dest`   | `string` | repo or path's name | Where to write the file or folder. |
| `ignore` | `string` | —                   | Comma-separated globs to skip.     |

Returns `{ dir, files }`: the resolved output path and how many files landed there.

## How it works

Core downloading is done by [giget](https://github.com/unjs/giget) — YAGNI 🧘‍♂️. Their page lists everything else that comes with it: private sources via `--auth`, GitLab / Bitbucket / Sourcehut,
**offline cache**.

As giget is a peer dependency so if already installed, this package simply enhances the DX.

## Development

```bash
bun install
bun run test
bun run typecheck
bun run build
bun run format
```

## License

[MIT](./LICENSE) © [jayF0x](https://github.com/jayf0x)
