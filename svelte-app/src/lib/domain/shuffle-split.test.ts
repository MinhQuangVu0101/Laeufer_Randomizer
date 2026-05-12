import { describe, expect, it } from 'vitest';
import { shuffleSplit } from './shuffle-split';

const seededRandom = (seed: number) => {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x80000000;
  };
};

const allNames = (...arrays: string[][]) => arrays.flat().sort();

describe('shuffleSplit', () => {
  it('fails with no_players for empty input', () => {
    const r = shuffleSplit({ mode: 'simple', players: [], teamSize: 6 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('no_players');
  });

  it('fails with no_players when all names are blank/whitespace', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['', '  ', '\n'], teamSize: 6 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('no_players');
  });

  it('1 player splits to team1, leaves team2 empty', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A'], teamSize: 6 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1).toEqual(['A']);
      expect(r.team2).toEqual([]);
      expect(r.bench).toEqual([]);
    }
  });

  it('2 players → 1 per team', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A', 'B'], teamSize: 6 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1).toHaveLength(1);
      expect(r.team2).toHaveLength(1);
      expect(r.bench).toEqual([]);
    }
  });

  it('4 players, teamSize=2 → 2 per team, no bench', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A', 'B', 'C', 'D'], teamSize: 2 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1).toHaveLength(2);
      expect(r.team2).toHaveLength(2);
      expect(r.bench).toEqual([]);
    }
  });

  it('5 players, teamSize=2 → 2 + 2 + 1 bench', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A', 'B', 'C', 'D', 'E'], teamSize: 2 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1).toHaveLength(2);
      expect(r.team2).toHaveLength(2);
      expect(r.bench).toHaveLength(1);
    }
  });

  it('5 players, teamSize=6 → 3/2 odd split, no bench', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A', 'B', 'C', 'D', 'E'], teamSize: 6 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1.length + r.team2.length).toBe(5);
      expect(Math.abs(r.team1.length - r.team2.length)).toBe(1);
      expect(r.bench).toEqual([]);
    }
  });

  it('7 players, teamSize=3 → 3 + 3 + 1 bench', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], teamSize: 3 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1).toHaveLength(3);
      expect(r.team2).toHaveLength(3);
      expect(r.bench).toHaveLength(1);
    }
  });

  it('teamSize=0 clamps to default 6', () => {
    const players = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const r = shuffleSplit({ mode: 'simple', players, teamSize: 0 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1.length).toBeLessThanOrEqual(6);
      expect(r.team2.length).toBeLessThanOrEqual(6);
    }
  });

  it('teamSize=15 clamps to 12', () => {
    const players = Array.from({ length: 25 }, (_, i) => `P${i}`);
    const r = shuffleSplit({ mode: 'simple', players, teamSize: 15 });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(r.team1.length).toBeLessThanOrEqual(12);
      expect(r.team2.length).toBeLessThanOrEqual(12);
      expect(r.bench).toHaveLength(25 - r.team1.length - r.team2.length);
    }
  });

  it('teamSize=NaN clamps to default', () => {
    const r = shuffleSplit({ mode: 'simple', players: ['A', 'B'], teamSize: Number.NaN });
    expect(r.ok).toBe(true);
  });

  it('deduplicates names (case-sensitive, exact match)', () => {
    const r = shuffleSplit({
      mode: 'simple',
      players: ['Quang', 'Quang', 'Anh', 'Quang'],
      teamSize: 6,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(allNames(r.team1, r.team2, r.bench)).toEqual(['Anh', 'Quang']);
    }
  });

  it('trims whitespace from names', () => {
    const r = shuffleSplit({
      mode: 'simple',
      players: [' Quang ', '  Anh\n'],
      teamSize: 6,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(allNames(r.team1, r.team2, r.bench)).toEqual(['Anh', 'Quang']);
    }
  });

  it('all unique players appear exactly once across team1+team2+bench', () => {
    const players = Array.from({ length: 13 }, (_, i) => `P${i}`);
    const r = shuffleSplit({ mode: 'simple', players, teamSize: 4 }, seededRandom(42));
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'simple') {
      expect(allNames(r.team1, r.team2, r.bench)).toEqual([...players].sort());
    }
  });

  it('produces reproducible output with seeded random', () => {
    const players = ['A', 'B', 'C', 'D', 'E', 'F'];
    const r1 = shuffleSplit({ mode: 'simple', players, teamSize: 3 }, seededRandom(7));
    const r2 = shuffleSplit({ mode: 'simple', players, teamSize: 3 }, seededRandom(7));
    expect(r1).toEqual(r2);
  });
});
