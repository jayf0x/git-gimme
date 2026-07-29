#!/usr/bin/env node
import { gitGet } from "../src/index.mjs";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const ignoreArg = args.find((a) => a.startsWith("--ignore="));
const [input, dest] = positional;

if (!input) {
  console.error("usage: git get <owner/repo | github-url> [dest] [--ignore=pattern,pattern]");
  process.exit(1);
}

try {
  const { dir, files } = await gitGet(input, {
    dest,
    ignore: ignoreArg?.slice("--ignore=".length),
  });
  console.log(`done: ${files} file(s) -> ${dir}`);
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
