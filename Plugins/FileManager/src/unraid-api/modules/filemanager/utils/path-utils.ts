import fs from 'fs';
import path from 'path';

export function isPathTraversal(p: string) {
  if (!p) return false;
  // Quick checks for traversal or null bytes
  if (p.includes('..') || p.includes('\0')) return true;
  try {
    const normalized = path.posix.normalize(p);
    if (normalized.startsWith('..')) return true;
  } catch (err) {
    return true;
  }
  return false;
}

export function sanitizeIncomingPath(p: string) {
  if (!p) return '';
  // Remove any repeated slashes and resolve
  return path.posix.normalize(p).replace(/\/+/g, '/');
}

export function isAllowedPath(p: string, roots: Array<{ name: string; path: string }>) {
  if (!p) return false;
  const normalized = path.posix.normalize(p).replace(/\/+/g, '/');
  for (const r of roots || []) {
    const rp = r.path || '';
    if (rp.includes('*')) {
      // Convert wildcard to regex - escape then replace
      const esc = rp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
      const re = new RegExp('^' + esc);
      if (re.test(normalized)) return true;
    } else {
      // Ensure root path ends with a slash for strict prefixing
      const base = rp.endsWith('/') ? rp : rp + '/';
      if (normalized === rp || normalized.startsWith(base) || normalized.startsWith(rp + '/')) return true;
    }
  }
  return false;
}

// New: resolve a path to its canonical real path (resolving symlinks)
export async function canonicalizePath(p: string): Promise<string | null> {
  if (!p) return null;
  try {
    // Use fs.promises.realpath to resolve symlinks and relative components
    const rp = await fs.promises.realpath(p);
    return path.posix.normalize(rp);
  } catch (err) {
    // If the path does not exist or cannot be resolved, return null
    return null;
  }
}

// Expand root patterns (very small glob support): '/mnt/disk*' -> ['/mnt/disk1', '/mnt/disk2']
export function expandRootPattern(rootPattern: string): string[] {
  if (!rootPattern.includes('*')) return [rootPattern];
  const parent = path.posix.dirname(rootPattern);
  const star = path.posix.basename(rootPattern);
  const prefix = star.split('*')[0];
  try {
    const names = fs.readdirSync(parent, { withFileTypes: true });
    return names
      .filter((d: any) => d.isDirectory() && d.name.startsWith(prefix))
      .map((d: any) => path.posix.join(parent, d.name));
  } catch (err) {
    return [rootPattern];
  }
}

// New: check if a canonical path is under any allowed root (resolving roots and comparing real paths)
export async function isAllowedRealPath(candidate: string, roots: Array<{ name: string; path: string }>): Promise<boolean> {
  if (!candidate) return false;
  const realCandidate = await canonicalizePath(candidate);
  if (!realCandidate) return false;

  for (const r of roots || []) {
    const rp = r.path || '';
    const expanded = expandRootPattern(rp);
    for (const e of expanded) {
      const realRoot = await canonicalizePath(e);
      if (!realRoot) continue; // skip non-existent roots
      const rootBase = realRoot.endsWith('/') ? realRoot : realRoot + '/';
      if (realCandidate === realRoot || realCandidate.startsWith(rootBase)) return true;
    }
  }
  return false;
}

export function resolveRelativeAgainstRoots(relative: string, roots: Array<{ name: string; path: string }>) {
  if (!relative) return [];
  const rel = relative.replace(/^\/+/, ''); // strip leading slashes
  const candidates: string[] = [];
  for (const r of roots || []) {
    const base = r.path || '';
    // If root contains a wildcard, expand patterns then join
    if (base.includes('*')) {
      const expanded = expandRootPattern(base);
      for (const e of expanded) {
        candidates.push(path.posix.join(e, rel));
      }
    } else {
      candidates.push(path.posix.join(base, rel));
    }
  }
  return candidates.map((c) => path.posix.normalize(c));
}

// New: attempt to resolve a relative path by finding the first canonical path that is allowed
export async function resolveRelativeToAllowedRealPath(relative: string, roots: Array<{ name: string; path: string }>) {
  const candidates = resolveRelativeAgainstRoots(relative, roots);
  for (const cand of candidates) {
    const real = await canonicalizePath(cand);
    if (!real) continue;
    const ok = await isAllowedRealPath(real, roots);
    if (ok) return real;
  }
  return null;
}

export function getVirtualRootPaths(idOrName: string, virtualRoots: Array<{ id?: string; name?: string; path: string }>) {
  if (!idOrName) return [];
  const found = virtualRoots.find((v) => v.id === idOrName || v.name === idOrName);
  if (!found) return [];
  return expandRootPattern(found.path);
}

// Resolve a relative path under a named virtual root (id or name)
export async function resolveRelativeToVirtualRoot(virtualRootIdOrName: string, relative: string, virtualRoots: Array<{ id?: string; name?: string; path: string }>) {
  const paths = getVirtualRootPaths(virtualRootIdOrName, virtualRoots);
  for (const p of paths) {
    const cand = path.posix.join(p, relative);
    const real = await canonicalizePath(cand);
    if (!real) continue;
    const ok = await isAllowedRealPath(real, virtualRoots.map((v) => ({ name: v.name || v.path, path: v.path })));
    if (ok) return real;
  }
  return null;
}
