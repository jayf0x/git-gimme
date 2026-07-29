# git-get

`git get <owner/repo|github-url> [dest]` — thin wrapper around [giget](https://github.com/unjs/giget) that fixes the rough edges you hit downloading a single file or subfolder from GitHub.

Install once, globally, and `git get` works as a native subcommand (git dispatches unrecognized commands to `git-<name>` on PATH — no shell config needed).

## What it fixes vs. plain giget

**Bare `owner/repo` doesn't mean what you'd expect.**
giget treats `owner/repo` as a *template registry* lookup, not a GitHub repo — it 404s unless you know to prefix `github:`. git-get always resolves plain shorthand and pasted GitHub URLs straight to the GitHub provider.

```
git get octocat/Hello-World          # giget: 404 (looks up registry template)
                                      # git-get: clones the repo
```

**Repos on `master` fail silently.**
giget hardcodes the ref to `"main"` when you don't specify one — any repo still on `master` (or anything else) just 404s. git-get resolves the real default branch via the GitHub API first.

**No way to download a single file.**
giget's subdir matching only understands directories — pointing it at a file path matches zero tar entries and silently extracts nothing. git-get detects this and fetches the file's parent dir, filters down to the one file, and drops it at the destination.

```
git get octocat/Hello-World/README        # single file, lands as ./README
git get github.com/octocat/Hello-World/blob/master/README   # same, from a pasted URL
```

**Ambiguous paths just work.**
Given `owner/repo/some/path` with no way to know upfront if `path` is a file or a folder, git-get tries directory mode first and falls back to file mode automatically — no separate flag or syntax for either case.

## Usage

```
git get <owner/repo | github-url> [dest] [--ignore=pattern,pattern]
```

- `owner/repo`, `owner/repo/sub/dir`, `owner/repo/sub/dir#ref` — shorthand
- full GitHub URLs: repo root, `/tree/<ref>/<path>`, `/blob/<ref>/<path>`
- `--ignore=*.mp4,*.lock` — comma-separated glob excludes, forwarded to giget

## Not (yet) in scope

Everything here is tarball-based, like giget itself — no `.git`, no history. A mode that keeps `.git` (via `git clone --filter=blob:none --sparse`) is a separate, still-unbuilt path.
