// Simple in-memory cache with TTL — avoids cold DB hits for public data
type Entry = { data: any; exp: number };
const store = new Map<string, Entry>();

export function getCache<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) { store.delete(key); return null; }
  return e.data as T;
}

export function setCache(key: string, data: any, ttlMs = 30_000) {
  store.set(key, { data, exp: Date.now() + ttlMs });
}

export function makeKey(url: string) {
  return url;
}
