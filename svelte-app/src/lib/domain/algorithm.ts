import {
  DEFAULT_TEAM_SIZE,
  MAX_TEAM_SIZE,
  MIN_TEAM_SIZE,
  POSITION_IDS,
  POSITION_META,
  type Position,
} from '../constants';
import { shuffle } from './shuffle';
import { shuffleSplit } from './shuffle-split';
import type {
  BenchPlayerWithPositions,
  GenerationInput,
  GenerationInputPositions,
  GenerationResult,
  PlayerWithPositions,
  Team,
} from './types';

function clampTeamSize(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n)) return DEFAULT_TEAM_SIZE;
  const rounded = Math.floor(n);
  if (rounded < MIN_TEAM_SIZE) return DEFAULT_TEAM_SIZE;
  return Math.min(rounded, MAX_TEAM_SIZE);
}

function emptyTeam(): Team {
  return { aussen: [], mitte: [], zuspieler: [], libero: [], diagonal: [] };
}

function limitsFor(noLibero: boolean): Record<Position, number> {
  return {
    aussen: POSITION_META.aussen.max,
    mitte: POSITION_META.mitte.max,
    zuspieler: POSITION_META.zuspieler.max,
    libero: noLibero ? 0 : POSITION_META.libero.max,
    diagonal: POSITION_META.diagonal.max,
  };
}

function teamCount(t: Team): number {
  return t.aussen.length + t.mitte.length + t.zuspieler.length + t.libero.length + t.diagonal.length;
}

function generatePositions(
  input: GenerationInputPositions,
  random: () => number,
): GenerationResult {
  const players = input.players.filter((p) => p.name.trim().length > 0 && p.positions.length > 0);
  if (players.length === 0) return { ok: false, reason: 'no_players' };

  const teamSize = clampTeamSize(input.teamSize);

  const pureLiberos = players.filter((p) => p.positions.length === 1 && p.positions[0] === 'libero');
  if (pureLiberos.length > 0 && input.team1NoLibero && input.team2NoLibero) {
    return {
      ok: false,
      reason: 'only_libero',
      affectedPlayers: pureLiberos.map((p) => p.name),
    };
  }

  // Shuffle for fairness, then sort by flexibility ascending so strict (single-position)
  // players claim their slot before flex players use them up.
  const shuffled = shuffle(players, random);
  const sorted = [...shuffled].sort((a, b) => a.positions.length - b.positions.length);

  const team1 = emptyTeam();
  const team2 = emptyTeam();
  const limits1 = limitsFor(input.team1NoLibero);
  const limits2 = limitsFor(input.team2NoLibero);
  const locked = new Set<string>();

  // Phase 1: Fill strict position quotas (Läufersystem: 2 AA / 2 MB / 1 ZS / 1 LI / 1 DI per team).
  // Scarcity-first: positions with smaller max are filled before larger max.
  // Within a position, alternate teams so neither team hogs a scarce position.
  const positionOrder: Position[] = [...POSITION_IDS].sort(
    (a, b) => POSITION_META[a].max - POSITION_META[b].max,
  );

  for (const pos of positionOrder) {
    let progress = true;
    while (progress) {
      progress = false;
      for (const teamNum of [1, 2] as const) {
        const team = teamNum === 1 ? team1 : team2;
        const limits = teamNum === 1 ? limits1 : limits2;
        const noLibero = teamNum === 1 ? input.team1NoLibero : input.team2NoLibero;

        if (noLibero && pos === 'libero') continue;
        if (team[pos].length >= limits[pos]) continue;
        if (teamCount(team) >= teamSize) continue;

        const candidate = sorted.find(
          (p) => !locked.has(p.name) && p.positions.includes(pos),
        );
        if (!candidate) continue;

        team[pos].push({
          name: candidate.name,
          position: pos,
          preferences: candidate.positions,
        });
        locked.add(candidate.name);
        progress = true;
      }
    }
  }

  // Phase 2: Distribute leftover players into overflow positions or bench.
  // Pick the team with fewer players to keep teams balanced; pick the least-loaded
  // valid position within that team so we don't pile everyone onto one spot.
  // Randomize at every tie-break so repeated runs with the same input produce
  // different overflow assignments (leftover order, team-on-equal-count,
  // position-on-equal-load).
  const leftover = shuffle(sorted.filter((p) => !locked.has(p.name)), random);
  const bench: BenchPlayerWithPositions[] = [];

  for (const p of leftover) {
    const t1Count = teamCount(team1);
    const t2Count = teamCount(team2);

    let targetIs1: boolean;
    if (t1Count >= teamSize && t2Count >= teamSize) {
      bench.push({ name: p.name, preferences: p.positions });
      continue;
    } else if (t1Count >= teamSize) {
      targetIs1 = false;
    } else if (t2Count >= teamSize) {
      targetIs1 = true;
    } else if (t1Count === t2Count) {
      targetIs1 = random() < 0.5;
    } else {
      targetIs1 = t1Count < t2Count;
    }

    const target = targetIs1 ? team1 : team2;
    const targetNoLibero = targetIs1 ? input.team1NoLibero : input.team2NoLibero;

    const validPositions = shuffle(
      p.positions.filter(
        (pos) => POSITION_IDS.includes(pos) && !(targetNoLibero && pos === 'libero'),
      ),
      random,
    );
    if (validPositions.length === 0) {
      bench.push({ name: p.name, preferences: p.positions });
      continue;
    }

    let bestPos = validPositions[0];
    for (const pos of validPositions) {
      if (target[pos].length < target[bestPos].length) bestPos = pos;
    }
    target[bestPos].push({ name: p.name, position: bestPos, preferences: p.positions });
  }

  return { ok: true, mode: 'positions', team1, team2, bench };
}

export function generateTeams(
  input: GenerationInput,
  random: () => number = Math.random,
): GenerationResult {
  if (input.mode === 'simple') {
    return shuffleSplit(input, random);
  }
  return generatePositions(input, random);
}
