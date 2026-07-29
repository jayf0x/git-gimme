import { downloadTemplate } from "giget";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { parseSource, buildGigetSource } from "./parse-source.mjs";

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true }).catch(() => []);
  return entries.filter((e) => e.isFile());
}

// giget hardcodes "main" when no ref is given — plenty of repos still
// default to "master" (or something else), so resolve it for real instead
// of guessing.
async function resolveRef(parsed) {
  if (parsed.ref) return parsed.ref;
  const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
  if (!res.ok) return parsed.ref;
  const { default_branch } = await res.json();
  return default_branch || parsed.ref;
}

async function downloadDir(parsed, dir, ignoreList) {
  const source = buildGigetSource(parsed);
  return downloadTemplate(source, { dir, force: true, ignore: ignoreList });
}

// giget's subdir matching only understands directories (it checks for a
// trailing "/" on every tar entry path), so a single file never matches as
// a subdir. Work around it: fetch the file's parent dir, keep only the one
// entry via the `ignore` callback, then move it to its final spot.
async function downloadFile(parsed, outPath) {
  const filename = path.posix.basename(parsed.subdir);
  const parentDir = path.posix.dirname(parsed.subdir);
  const source = buildGigetSource({
    ...parsed,
    subdir: parentDir === "." ? "" : parentDir,
  });

  const tmpDir = `${outPath}.git-get-tmp`;
  await rm(tmpDir, { recursive: true, force: true });
  await downloadTemplate(source, {
    dir: tmpDir,
    force: true,
    ignore: (p) => p !== filename,
  });

  await mkdir(path.dirname(outPath), { recursive: true });
  await rename(path.join(tmpDir, filename), outPath);
  await rm(tmpDir, { recursive: true, force: true });
}

export async function gitGet(input, { dest, ignore } = {}) {
  const parsed = parseSource(input);
  parsed.ref = await resolveRef(parsed);
  const ignoreList = ignore
    ? ignore.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const baseName = parsed.subdir ? path.posix.basename(parsed.subdir) : parsed.repo;

  if (parsed.hint === "file") {
    const outPath = path.resolve(dest || baseName);
    await downloadFile(parsed, outPath);
    return { dir: outPath, files: 1 };
  }

  const outDir = path.resolve(dest || baseName);

  if (parsed.hint === "dir") {
    const result = await downloadDir(parsed, outDir, ignoreList);
    return { dir: result.dir, files: (await listFiles(result.dir)).length };
  }

  // hint === "auto": ambiguous shorthand, try dir-mode, fall back to file-mode
  const result = await downloadDir(parsed, outDir, ignoreList);
  const files = await listFiles(result.dir);
  if (files.length > 0 || !parsed.subdir) {
    return { dir: result.dir, files: files.length };
  }

  await rm(result.dir, { recursive: true, force: true });
  const outPath = path.resolve(dest || baseName);
  await downloadFile(parsed, outPath);
  return { dir: outPath, files: 1 };
}
