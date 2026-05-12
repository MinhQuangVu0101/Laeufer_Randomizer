import { beforeEach, describe, expect, it } from 'vitest';
import { HistoryStore, entryFromResult } from './history.svelte';
import { FakeStorage } from '../test-utils/fake-storage';
import type { GenerationResult, Team } from '../domain/types';

const positionResult = (id: string): GenerationResult => {
  const emptyTeam = (): Team => ({ aussen: [], mitte: [], zuspieler: [], libero: [], diagonal: [] });
  const t1 = emptyTeam();
  t1.aussen.push({ name: `A-${id}`, position: 'aussen', preferences: ['aussen'] });
  const t2 = emptyTeam();
  t2.mitte.push({ name: `M-${id}`, position: 'mitte', preferences: ['mitte'] });
  return {
    ok: true,
    mode: 'positions',
    team1: t1,
    team2: t2,
    bench: [{ name: `B-${id}`, preferences: ['aussen'] }],
  };
};

const simpleResult = (id: string): GenerationResult => ({
  ok: true,
  mode: 'simple',
  team1: [`P1-${id}`, `P2-${id}`],
  team2: [`P3-${id}`],
  bench: [],
});

const failureResult: GenerationResult = { ok: false, reason: 'no_players' };

describe('entryFromResult', () => {
  it('returns null for failure', () => {
    expect(entryFromResult(failureResult)).toBeNull();
  });

  it('formats positions mode with badges', () => {
    const entry = entryFromResult(positionResult('1'));
    expect(entry?.mode).toBe('positions');
    expect(entry?.team1).toContain('aussen: A-1');
    expect(entry?.team2).toContain('mitte: M-1');
    expect(entry?.bench).toBe('B-1');
  });

  it('formats simple mode as comma list', () => {
    const entry = entryFromResult(simpleResult('1'));
    expect(entry?.mode).toBe('simple');
    expect(entry?.team1).toBe('P1-1, P2-1');
    expect(entry?.team2).toBe('P3-1');
    expect(entry?.bench).toBe('');
  });
});

describe('HistoryStore', () => {
  let store: HistoryStore;

  beforeEach(() => {
    store = new HistoryStore(new FakeStorage());
  });

  it('starts empty', () => {
    expect(store.isEmpty).toBe(true);
    expect(store.all).toEqual([]);
  });

  it('add() inserts newest first', () => {
    store.add(positionResult('1'));
    store.add(positionResult('2'));
    expect(store.all[0].team1).toContain('A-2');
    expect(store.all[1].team1).toContain('A-1');
  });

  it('caps at 3 entries (oldest dropped)', () => {
    store.add(positionResult('1'));
    store.add(positionResult('2'));
    store.add(positionResult('3'));
    store.add(positionResult('4'));
    expect(store.all).toHaveLength(3);
    expect(store.all[0].team1).toContain('A-4');
    expect(store.all[2].team1).toContain('A-2');
  });

  it('add() returns false for failure results', () => {
    expect(store.add(failureResult)).toBe(false);
    expect(store.isEmpty).toBe(true);
  });

  it('persists to storage', () => {
    const storage = new FakeStorage();
    const s = new HistoryStore(storage);
    s.add(positionResult('persisted'));
    const raw = storage.getItem('vb_history_v2');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].team1).toContain('A-persisted');
  });

  it('hydrates from storage', () => {
    const storage = new FakeStorage();
    const s1 = new HistoryStore(storage);
    s1.add(positionResult('a'));
    s1.add(simpleResult('b'));
    const s2 = new HistoryStore(storage);
    expect(s2.all).toHaveLength(2);
    expect(s2.all[0].mode).toBe('simple');
  });

  it('ignores corrupt JSON', () => {
    const storage = new FakeStorage();
    storage.setItem('vb_history_v2', '{not json');
    const s = new HistoryStore(storage);
    expect(s.isEmpty).toBe(true);
  });

  it('ignores entries with invalid shape', () => {
    const storage = new FakeStorage();
    storage.setItem(
      'vb_history_v2',
      JSON.stringify([{ time: 123, mode: 'invalid', team1: 'x' }, null, 'string-entry']),
    );
    const s = new HistoryStore(storage);
    expect(s.isEmpty).toBe(true);
  });

  it('clear() empties and persists', () => {
    const storage = new FakeStorage();
    const s = new HistoryStore(storage);
    s.add(positionResult('1'));
    s.clear();
    expect(s.isEmpty).toBe(true);
    const raw = storage.getItem('vb_history_v2');
    expect(JSON.parse(raw!)).toEqual([]);
  });
});
