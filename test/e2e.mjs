import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const BIN = path.resolve(import.meta.dirname, "../bin/git-get.mjs");
const REPO = "jayf0x/git-folder";

async function withTmpDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "git-get-e2e-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function testDirDownload() {
  await withTmpDir(async (cwd) => {
    await run("node", [BIN, `${REPO}/fixtures`], { cwd });
    const a = await readFile(path.join(cwd, "fixtures", "a.txt"), "utf8");
    const b = await readFile(path.join(cwd, "fixtures", "b.txt"), "utf8");
    const c = await readFile(path.join(cwd, "fixtures", "sub", "c.txt"), "utf8");
    assert.equal(a, "A");
    assert.equal(b, "B");
    assert.equal(c, "C");
  });
  console.log("PASS: directory download (fixtures/)");
}

async function testSingleFileDownload() {
  await withTmpDir(async (cwd) => {
    await run("node", [BIN, `${REPO}/fixtures/a.txt`], { cwd });
    const a = await readFile(path.join(cwd, "a.txt"), "utf8");
    assert.equal(a, "A");
  });
  console.log("PASS: single-file download (fixtures/a.txt)");
}

async function testNestedSingleFileDownload() {
  await withTmpDir(async (cwd) => {
    await run("node", [BIN, `${REPO}/fixtures/sub/c.txt`], { cwd });
    const c = await readFile(path.join(cwd, "c.txt"), "utf8");
    assert.equal(c, "C");
  });
  console.log("PASS: nested single-file download (fixtures/sub/c.txt)");
}

async function testIgnorePattern() {
  await withTmpDir(async (cwd) => {
    await run("node", [BIN, `${REPO}/fixtures`, "--ignore=b.txt"]  , { cwd });
    const a = await readFile(path.join(cwd, "fixtures", "a.txt"), "utf8");
    assert.equal(a, "A");
    await assert.rejects(readFile(path.join(cwd, "fixtures", "b.txt"), "utf8"));
  });
  console.log("PASS: --ignore excludes matched files (fixtures/, ignore b.txt)");
}

const tests = [testDirDownload, testSingleFileDownload, testNestedSingleFileDownload, testIgnorePattern];

let failed = false;
for (const test of tests) {
  try {
    await test();
  } catch (err) {
    failed = true;
    console.error(`FAIL: ${test.name}`);
    console.error(err);
  }
}

process.exit(failed ? 1 : 0);
