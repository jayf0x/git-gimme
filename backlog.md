# Backlog

Ideas not (yet) built. Roughly ordered by value per line of code.

## Worth building

- **`@ref` as an alias for `#ref`.** `git gimme owner/repo/dir#v2` needs quoting in bash, where `#`
  starts a comment. Accepting `@v2` too is a regex change in `parse-source.ts` and removes a footgun
  that bites on first use.

- **Print to stdout.** `git gimme owner/repo/file.json -` writes the file to stdout instead of disk,
  so it pipes into `jq`, `less`, `diff`, `code -`. Single-file mode already ends with exactly one
  file in a temp dir — this is a `createReadStream().pipe(process.stdout)` instead of the final
  `rename`. Nothing else in this space does it, and it is the shape "I just want to look at that
  one file" actually wants.

- **Don't clobber silently.** `downloadTemplate` runs with `force: true`, so an existing destination
  is overwritten without a word. Refuse if the destination exists and is non-empty, unless
  `--force`. Cheap, and the current behaviour can eat work.

- **Pick up `gh auth token`.** giget reads `GIGET_AUTH` for private sources. If it is unset and the
  `gh` CLI is installed and logged in, use its token. One `execFile`, and private repos start
  working with no setup.

- **Short flags.** `-i` for `--ignore`, `-f` for `--force`, `-o` for `--offline`. Mechanical, and it
  is our CLI, so opinionated aliasing is fair here rather than an issue on giget.

- **Forward the rest of giget's flags.** Today only `--ignore` is understood; `--auth`, `--offline`,
  `--prefer-offline`, `--cwd`, `--registry` are all supported by `downloadTemplate` and simply not
  wired up. Pass them through instead of reimplementing them.

- **`--dry-run`.** List what would land, download nothing. Useful before pointing this at an
  unfamiliar folder.

- **Multiple sources in one call.** `git gimme owner/repo/a.md owner/repo/b.md ./dest`. Currently
  the second positional is the destination, so this needs a syntax decision first (e.g. sources
  before `--to <dir>`).

## Worth building, with a caveat

- **Default ignore patterns.** A config file with defaults (`*.mp4`, `dist`, …) plus
  `--ignore-file <path>` to read patterns from a file. Two caveats: store the config in
  `~/.config/git-gimme/` (XDG), **not** in giget's cache dir — that dir is disposable and gets
  cleared. And `.gitignore` syntax is not `path.matchesGlob` syntax: negation (`!`), anchoring
  (`/build`) and directory suffixes (`node_modules/`) do not translate. Support the simple subset
  and say so, or skip the `.gitignore` framing entirely.

- **Progress output.** Not possible by watching giget: `downloadTemplate` is a library call that
  prints nothing to capture. Two real options: (a) a spinner plus final file count, zero deps,
  written to stderr — 10 lines; (b) an actual byte-progress bar, which needs us to own the fetch via
  a giget _custom provider_ (`tar` may be a function returning a `ReadableStream`), counting chunks
  against `content-length`. (b) is genuinely viable and would give the tool a face, but it means
  maintaining a provider — do (a) first and only reach for (b) if it still feels missing.

## Better filed upstream

- Single-file extraction (giget's subdir matching only ever matches directories) is a real gap in
  giget, not an opinion. Worth an issue there; our workaround in `downloadFile` can go away if it
  lands.

## CUT

Chosen not to implement, kept as backlog.

- **`--prefer-offline` by default.** A cached hit means "gimme the README" can quietly hand back a
  stale file, and there is no signal that it did. Wrong default for a tool whose whole job is
  fetching the current state. A narrower version is defensible: default to the cache only when the
  ref is immutable (a tag or full commit SHA), never for a branch.

- **Keep `.git` mode.** Everything today is tarball-based, like giget itself — no `.git`, no
  history. giget added a `git:` provider with sparse checkout in 3.2.0, so if this is ever wanted it
  is a flag that switches provider, not a feature we write. Still: wanting history means wanting a
  clone, which is not what this tool is for.
