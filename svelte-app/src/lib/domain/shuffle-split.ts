import { DEFAULT_TEAM_SIZE, MAX_TEAM_SIZE, MIN_TEAM_SIZE } from '../constants';
import { shuffle } from './shuffle';
import type { GenerationInputSimple, GenerationResult } from './types';

function clampTeamSize(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n)) return DEFAULT_TEAM_SIZE;
  const rounded = Math.floor(n);
  if (rounded < MIN_TEAM_SIZE) return DEFAULT_TEAM_SIZE;
  return Math.min(rounded, MAX_TEAM_SIZE);
}

function dedupe(names: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (trimmed.length === 0) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function shuffleSplit(
  input: GenerationInputSimple,
  random: () => number = Math.random,
): GenerationResult {
  const players = dedupe(input.players);
  if (players.length === 0) return { ok: false, reason: 'no_players' };

  const teamSize = clampTeamSize(input.teamSize);
  const shuffled = shuffle(players, random);
  const total = shuffled.length;

  let t1Count = Math.min(Math.ceil(total / 2), teamSize);
  let t2Count = Math.min(total - t1Count, teamSize);

  if (t1Count > teamSize) t1Count = teamSize;
  if (t2Count > teamSize) t2Count = teamSize;

  const team1 = shuffled.slice(0, t1Count);
  const team2 = shuffled.slice(t1Count, t1Count + t2Count);
  const bench = shuffled.slice(t1Count + t2Count);

  return {
    ok: true,
    mode: 'simple',
    team1,
    team2,
    bench,
  };
}
