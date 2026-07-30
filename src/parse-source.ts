export type SourceHint = 'dir' | 'file' | 'auto';

export type ParsedSource = {
  owner: string;
  repo: string;
  ref?: string;
  subdir: string;
  hint: SourceHint;
};

const TREE_URL = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+?)\/?$/;
const BLOB_URL = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
const REPO_URL = /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/;
const SHORTHAND = /^([\w.-]+)\/([\w.-]+)(?:\/(.+?))?(?:#([\w./-]+))?$/;

// hint: "dir" and "file" come from URL shapes that say so explicitly
// (GitHub's own /tree/ vs /blob/ distinction). "auto" means the shorthand
// form is ambiguous and the caller has to try dir-mode first, file-mode second.
export function parseSource(input: string): ParsedSource {
  const tree = TREE_URL.exec(input);
  if (tree) {
    return { owner: tree[1], repo: tree[2], ref: tree[3], subdir: tree[4], hint: 'dir' };
  }
  const blob = BLOB_URL.exec(input);
  if (blob) {
    return { owner: blob[1], repo: blob[2], ref: blob[3], subdir: blob[4], hint: 'file' };
  }
  const repoUrl = REPO_URL.exec(input);
  if (repoUrl) {
    return { owner: repoUrl[1], repo: repoUrl[2], ref: undefined, subdir: '', hint: 'dir' };
  }
  const shorthand = SHORTHAND.exec(input);
  if (shorthand) {
    return { owner: shorthand[1], repo: shorthand[2], subdir: shorthand[3] || '', ref: shorthand[4], hint: 'auto' };
  }
  throw new Error(`Unrecognized source: ${input}`);
}

export function buildGigetSource({ owner, repo, subdir, ref }: ParsedSource): string {
  // giget's bare "owner/repo" shorthand means "look up this name in the
  // template registry", not "clone this GitHub repo" — the github: prefix
  // is what actually selects the github provider.
  let s = `github:${owner}/${repo}`;
  if (subdir) s += `/${subdir}`;
  if (ref) s += `#${ref}`;
  return s;
}
