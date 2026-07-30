import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const CLI = path.resolve(import.meta.dir, '../dist/cli.js');
const REPO = 'jayf0x/git-folder';

async function withTmpDir(fn: (dir: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'git-get-e2e-'));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('git-get CLI (dist/cli.js)', () => {
  test('directory download (tests/fixtures/)', async () => {
    await withTmpDir(async (cwd) => {
      await run('node', [CLI, `${REPO}/tests/fixtures`], { cwd });
      const a = await readFile(path.join(cwd, 'fixtures', 'a.txt'), 'utf8');
      const b = await readFile(path.join(cwd, 'fixtures', 'b.txt'), 'utf8');
      const c = await readFile(path.join(cwd, 'fixtures', 'sub', 'c.txt'), 'utf8');
      assert.equal(a, 'A');
      assert.equal(b, 'B');
      assert.equal(c, 'C');
    });
  });

  test('single-file download (tests/fixtures/a.txt)', async () => {
    await withTmpDir(async (cwd) => {
      await run('node', [CLI, `${REPO}/tests/fixtures/a.txt`], { cwd });
      const a = await readFile(path.join(cwd, 'a.txt'), 'utf8');
      assert.equal(a, 'A');
    });
  });

  test('nested single-file download (tests/fixtures/sub/c.txt)', async () => {
    await withTmpDir(async (cwd) => {
      await run('node', [CLI, `${REPO}/tests/fixtures/sub/c.txt`], { cwd });
      const c = await readFile(path.join(cwd, 'c.txt'), 'utf8');
      assert.equal(c, 'C');
    });
  });

  test('--ignore excludes matched files (tests/fixtures/, ignore b.txt)', async () => {
    await withTmpDir(async (cwd) => {
      await run('node', [CLI, `${REPO}/tests/fixtures`, '--ignore=b.txt'], { cwd });
      const a = await readFile(path.join(cwd, 'fixtures', 'a.txt'), 'utf8');
      assert.equal(a, 'A');
      await assert.rejects(readFile(path.join(cwd, 'fixtures', 'b.txt'), 'utf8'));
    });
  });
});
