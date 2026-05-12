import { describe, expect, it } from 'vitest';
import { PoolStore, DEFAULT_POOL } from './pool.svelte';
import { FakeStorage } from '../test-utils/fake-storage';
import { STORAGE_KEYS } from '../constants';

const makeStore = () => new PoolStore(new FakeStorage());

describe('PoolStore', () => {
  it('boots with default preset pool of 23 names', () => {
    const p = makeStore();
    expect(p.size).toBe(23);
    expect(p.all).toEqual(DEFAULT_POOL);
  });

  it('add appends new name and returns true', () => {
    const p = makeStore();
    expect(p.add('NewPlayer')).toBe(true);
    expect(p.has('NewPlayer')).toBe(true);
  });

  it('add returns false for duplicate', () => {
    const p = makeStore();
    p.add('Quang');
    expect(p.add('Quang')).toBe(false);
  });

  it('add trims whitespace', () => {
    const p = makeStore();
    p.add('  Spacey  ');
    expect(p.has('Spacey')).toBe(true);
    expect(p.has('  Spacey  ')).toBe(false);
  });

  it('add rejects empty string', () => {
    const p = makeStore();
    const sizeBefore = p.size;
    expect(p.add('')).toBe(false);
    expect(p.add('   ')).toBe(false);
    expect(p.size).toBe(sizeBefore);
  });

  it('remove deletes existing name', () => {
    const p = makeStore();
    expect(p.remove('Quang')).toBe(true);
    expect(p.has('Quang')).toBe(false);
  });

  it('remove returns false for non-existent name', () => {
    const p = makeStore();
    expect(p.remove('Nobody')).toBe(false);
  });

  it('persists add to storage', () => {
    const storage = new FakeStorage();
    const p = new PoolStore(storage);
    p.add('Persistent');
    const raw = storage.getItem(STORAGE_KEYS.pool);
    expect(JSON.parse(raw!)).toContain('Persistent');
  });

  it('persists remove to storage', () => {
    const storage = new FakeStorage();
    const p = new PoolStore(storage);
    p.remove('Quang');
    const raw = storage.getItem(STORAGE_KEYS.pool);
    expect(JSON.parse(raw!)).not.toContain('Quang');
  });

  it('hydrates from storage', () => {
    const storage = new FakeStorage();
    storage.setItem(STORAGE_KEYS.pool, JSON.stringify(['Solo']));
    const p = new PoolStore(storage);
    expect(p.size).toBe(1);
    expect(p.has('Solo')).toBe(true);
  });

  it('hydrate dedups and trims', () => {
    const storage = new FakeStorage();
    storage.setItem(STORAGE_KEYS.pool, JSON.stringify(['A', '  A ', 'B', '', 'A']));
    const p = new PoolStore(storage);
    expect([...p.all].sort()).toEqual(['A', 'B']);
  });

  it('ignores corrupt JSON and keeps defaults', () => {
    const storage = new FakeStorage();
    storage.setItem(STORAGE_KEYS.pool, '[not valid');
    const p = new PoolStore(storage);
    expect(p.size).toBe(23);
  });

  it('resetToDefaults restores preset list', () => {
    const p = makeStore();
    p.remove('Quang');
    p.add('Other');
    p.resetToDefaults();
    expect(p.all).toEqual(DEFAULT_POOL);
  });
});
