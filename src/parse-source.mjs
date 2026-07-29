const TREE_URL = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+?)\/?$/;
const BLOB_URL = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
const REPO_URL = /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/;
const SHORTHAND = /^([\w.-]+)\/([\w.-]+)(?:\/(.+?))?(?:#([\w./-]+))?$/;

// hint: "dir" and "file" come from URL shapes that say so explicitly
// (GitHub's own /tree/ vs /blob/ distinction). "auto" means the shorthand
// form is ambiguous and the caller has to try dir-mode first, file-mode second.
export function parseSource(input) {
  let m;
  if ((m = TREE_URL.exec(input))) {
    return { owner: m[1], repo: m[2], ref: m[3], subdir: m[4], hint: "dir" };
  }
  if ((m = BLOB_URL.exec(input))) {
    return { owner: m[1], repo: m[2], ref: m[3], subdir: m[4], hint: "file" };
  }
  if ((m = REPO_URL.exec(input))) {
    return { owner: m[1], repo: m[2], ref: undefined, subdir: "", hint: "dir" };
  }
  if ((m = SHORTHAND.exec(input))) {
    return { owner: m[1], repo: m[2], subdir: m[3] || "", ref: m[4], hint: "auto" };
  }
  throw new Error(`Unrecognized source: ${input}`);
}

export function buildGigetSource({ owner, repo, subdir, ref }) {
  // giget's bare "owner/repo" shorthand means "look up this name in the
  // template registry", not "clone this GitHub repo" — the github: prefix
  // is what actually selects the github provider.
  let s = `github:${owner}/${repo}`;
  if (subdir) s += `/${subdir}`;
  if (ref) s += `#${ref}`;
  return s;
}
