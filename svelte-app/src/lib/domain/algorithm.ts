import { DEFAULT_TEAM_SIZE, MAX_TEAM_SIZE, MIN_TEAM_SIZE } from '../constants';
import { assignToPositions } from './backtrack';
import { shuffle } from './shuffle';
import { shuffleSplit } from './shuffle-split';
import type {
  BenchPlayerWithPositions,
  GenerationInput,
  GenerationInputPositions,
  GenerationResult,
  PlayerWithPositions,
} from './types';

const POSITIONS_MAX_ATTEMPTS = 15;

function clampTeamSize(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n)) return DEFAULT_TEAM_SIZE;
  const rounded = Math.floor(n);
  if (rounded < MIN_TEAM_SIZE) return DEFAULT_TEAM_SIZE;
  return Math.min(rounded, MAX_TEAM_SIZE);
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

  const others = players.filter((p) => !(p.positions.length === 1 && p.positions[0] === 'libero'));

  let bestResult: GenerationResult | null = null;
  let bestSkippedCount = Infinity;

  for (let attempt = 0; attempt < POSITIONS_MAX_ATTEMPTS; attempt++) {
    const shuffledLib = shuffle(pureLiberos, random);
    const shuffledOthers = shuffle(others, random);

    const t1Players: PlayerWithPositions[] = [];
    const t2Players: PlayerWithPositions[] = [];

    if (input.team1NoLibero && !input.team2NoLibero) {
      t2Players.push(...shuffledLib);
    } else if (!input.team1NoLibero && input.team2NoLibero) {
      t1Players.push(...shuffledLib);
    } else {
      shuffledLib.forEach((p, i) => {
        (i % 2 === 0 ? t1Players : t2Players).push(p);
      });
    }

    const remaining = [...shuffledOthers];
    while (remaining.length > 0) {
      if (t1Players.length < teamSize && remaining.length > 0) {
        t1Players.push(remaining.shift()!);
      }
      if (t2Players.length < teamSize && remaining.length > 0) {
        t2Players.push(remaining.shift()!);
      }
      if (t1Players.length >= teamSize && t2Players.length >= teamSize) break;
    }

    const benchPlayers: BenchPlayerWithPositions[] = remaining.map((p) => ({
      name: p.name,
      preferences: p.positions,
    }));

    const r1 = assignToPositions(t1Players, input.team1NoLibero);
    const r2 = assignToPositions(t2Players, input.team2NoLibero);
    const totalSkipped = r1.skipped.length + r2.skipped.length;

    if (totalSkipped === 0) {
      return {
        ok: true,
        mode: 'positions',
        team1: r1.team,
        team2: r2.team,
        bench: benchPlayers,
      };
    }

    if (totalSkipped < bestSkippedCount) {
      bestSkippedCount = totalSkipped;
      const unassignedAsBench: BenchPlayerWithPositions[] = [
        ...benchPlayers,
        ...r1.skipped.map((p) => ({ name: p.name, preferences: p.positions })),
        ...r2.skipped.map((p) => ({ name: p.name, preferences: p.positions })),
      ];
      bestResult = {
        ok: true,
        mode: 'positions',
        team1: r1.team,
        team2: r2.team,
        bench: unassignedAsBench,
      };
    }
  }

  if (bestResult) return bestResult;
  return { ok: false, reason: 'no_solution' };
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
