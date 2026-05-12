import { describe, expect, it } from 'vitest';
import { generateTeams } from './algorithm';
import type { PlayerWithPositions, Team } from './types';

const p = (name: string, ...positions: PlayerWithPositions['positions']): PlayerWithPositions => ({
  name,
  positions,
});

const teamNames = (t: Team): string[] =>
  Object.values(t)
    .flat()
    .map((x) => x.name)
    .sort();

describe('generateTeams (dispatcher)', () => {
  it('routes simple mode to shuffleSplit', () => {
    const r = generateTeams({ mode: 'simple', players: ['A', 'B', 'C', 'D'], teamSize: 2 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe('simple');
  });

  it('routes positions mode to backtracking generator', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [
        p('A1', 'aussen'),
        p('A2', 'aussen'),
        p('M1', 'mitte'),
        p('Z1', 'zuspieler'),
        p('L1', 'libero'),
        p('D1', 'diagonal'),
        p('A3', 'aussen'),
        p('A4', 'aussen'),
        p('M2', 'mitte'),
        p('Z2', 'zuspieler'),
        p('L2', 'libero'),
        p('D2', 'diagonal'),
      ],
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 6,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      expect(teamNames(r.team1)).toHaveLength(6);
      expect(teamNames(r.team2)).toHaveLength(6);
      expect(r.bench).toHaveLength(0);
    }
  });
});

describe('generateTeams (positions mode)', () => {
  it('fails with no_players when no players', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [],
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 6,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('no_players');
  });

  it('fails with only_libero when pure liberos exist and both teams refuse libero', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [p('L1', 'libero'), p('L2', 'libero'), p('A1', 'aussen')],
      team1NoLibero: true,
      team2NoLibero: true,
      teamSize: 6,
    });
    expect(r.ok).toBe(false);
    if (!r.ok && r.reason === 'only_libero') {
      expect(r.affectedPlayers.sort()).toEqual(['L1', 'L2']);
    }
  });

  it('routes liberos to team2 when team1NoLibero=true', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [
        p('L1', 'libero'),
        p('A1', 'aussen'),
        p('A2', 'aussen'),
        p('M1', 'mitte'),
        p('Z1', 'zuspieler'),
        p('D1', 'diagonal'),
        p('A3', 'aussen'),
        p('A4', 'aussen'),
        p('M2', 'mitte'),
        p('Z2', 'zuspieler'),
        p('D2', 'diagonal'),
      ],
      team1NoLibero: true,
      team2NoLibero: false,
      teamSize: 6,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      expect(r.team1.libero).toHaveLength(0);
      expect(r.team2.libero.map((x) => x.name)).toEqual(['L1']);
    }
  });

  it('puts unfit players on bench when total > 2 * teamSize', () => {
    const players = [
      p('A1', 'aussen'),
      p('A2', 'aussen'),
      p('M1', 'mitte'),
      p('Z1', 'zuspieler'),
      p('L1', 'libero'),
      p('D1', 'diagonal'),
      p('A3', 'aussen'),
      p('A4', 'aussen'),
      p('M2', 'mitte'),
      p('Z2', 'zuspieler'),
      p('L2', 'libero'),
      p('D2', 'diagonal'),
      p('BENCH1', 'aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'),
      p('BENCH2', 'aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'),
    ];
    const r = generateTeams({
      mode: 'positions',
      players,
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 6,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      expect(r.bench).toHaveLength(2);
    }
  });

  it('filters out players with empty positions', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [p('Ghost'), p('A1', 'aussen'), p('M1', 'mitte')],
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 6,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      const all = [
        ...teamNames(r.team1),
        ...teamNames(r.team2),
        ...r.bench.map((b) => b.name),
      ];
      expect(all).not.toContain('Ghost');
    }
  });

  it('falls back to best-effort when strict constraints cannot be satisfied', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [
        p('A1', 'aussen'),
        p('A2', 'aussen'),
        p('A3', 'aussen'),
        p('A4', 'aussen'),
        p('A5', 'aussen'),
        p('A6', 'aussen'),
      ],
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 3,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      const t1Total = teamNames(r.team1).length;
      const t2Total = teamNames(r.team2).length;
      expect(t1Total).toBeGreaterThan(0);
      expect(t2Total).toBeGreaterThan(0);
      expect(t1Total + t2Total).toBe(6);
    }
  });

  it('fills Läufersystem quotas first (2 AA / 2 MB / 1 ZS / 1 LI / 1 DI per team)', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [
        p('A1', 'aussen'),
        p('A2', 'aussen'),
        p('A3', 'aussen'),
        p('A4', 'aussen'),
        p('M1', 'mitte'),
        p('M2', 'mitte'),
        p('M3', 'mitte'),
        p('M4', 'mitte'),
        p('Z1', 'zuspieler'),
        p('Z2', 'zuspieler'),
        p('L1', 'libero'),
        p('L2', 'libero'),
        p('D1', 'diagonal'),
        p('D2', 'diagonal'),
      ],
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 7,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      expect(r.team1.aussen).toHaveLength(2);
      expect(r.team1.mitte).toHaveLength(2);
      expect(r.team1.zuspieler).toHaveLength(1);
      expect(r.team1.libero).toHaveLength(1);
      expect(r.team1.diagonal).toHaveLength(1);
      expect(r.team2.aussen).toHaveLength(2);
      expect(r.team2.mitte).toHaveLength(2);
      expect(r.team2.zuspieler).toHaveLength(1);
      expect(r.team2.libero).toHaveLength(1);
      expect(r.team2.diagonal).toHaveLength(1);
      expect(r.bench).toHaveLength(0);
    }
  });

  it('overflows leftover players into least-loaded position when teamSize > quota', () => {
    const r = generateTeams({
      mode: 'positions',
      players: [
        p('A1', 'aussen'),
        p('A2', 'aussen'),
        p('A3', 'aussen'),
        p('A4', 'aussen'),
        p('A5', 'aussen'),
        p('A6', 'aussen'),
        p('M1', 'mitte'),
        p('M2', 'mitte'),
        p('Z1', 'zuspieler'),
        p('Z2', 'zuspieler'),
        p('L1', 'libero'),
        p('L2', 'libero'),
        p('D1', 'diagonal'),
        p('D2', 'diagonal'),
      ],
      team1NoLibero: false,
      team2NoLibero: false,
      teamSize: 7,
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.mode === 'positions') {
      expect(teamNames(r.team1).length).toBe(7);
      expect(teamNames(r.team2).length).toBe(7);
      expect(r.bench).toHaveLength(0);
      // 2 extra aussen players land on aussen (overflow), so one team has 3 aussen
      const totalAussen = r.team1.aussen.length + r.team2.aussen.length;
      expect(totalAussen).toBe(6);
    }
  });
});
