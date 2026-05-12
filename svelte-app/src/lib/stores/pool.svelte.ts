import { STORAGE_KEYS } from '../constants';
import { getDefaultStorage } from './storage';

export const DEFAULT_POOL: readonly string[] = [
  'Quang', 'Anh', 'Erik', 'Tom', 'Ben', 'Claudio', 'David', 'Elena',
  'Ermin', 'Georg', 'Heiko', 'Janika', 'Jonas', 'Jun-Min', 'Karim',
  'Lara', 'Laura', 'Lisa', 'Omid', 'Pablo', 'PauTom', 'Justus', 'Tim',
];

export class PoolStore {
  private inner = $state<string[]>([...DEFAULT_POOL]);
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = getDefaultStorage()) {
    this.storage = storage;
    this.hydrate();
  }

  private hydrate() {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(STORAGE_KEYS.pool);
      if (raw == null) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .filter((x): x is string => typeof x === 'string')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const deduped = [...new Set(cleaned)];
      this.inner.length = 0;
      this.inner.push(...deduped);
    } catch {
      // corrupt → keep defaults
    }
  }

  private persist() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEYS.pool, JSON.stringify(this.inner));
    } catch {
      // quota / disabled — silently drop
    }
  }

  get all(): readonly string[] {
    return this.inner;
  }

  get size(): number {
    return this.inner.length;
  }

  has(name: string): boolean {
    return this.inner.includes(name);
  }

  add(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (this.inner.includes(trimmed)) return false;
    this.inner.push(trimmed);
    this.persist();
    return true;
  }

  remove(name: string): boolean {
    const idx = this.inner.indexOf(name);
    if (idx === -1) return false;
    this.inner.splice(idx, 1);
    this.persist();
    return true;
  }

  resetToDefaults() {
    this.inner.length = 0;
    this.inner.push(...DEFAULT_POOL);
    this.persist();
  }
}

export const pool = new PoolStore();
