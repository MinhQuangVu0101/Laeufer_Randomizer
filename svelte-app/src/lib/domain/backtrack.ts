import { POSITION_IDS, POSITION_META, type Position } from '../constants';
import type { PlayerWithPositions, Team } from './types';

export type AssignResult = {
  team: Team;
  skipped: PlayerWithPositions[];
};

function emptyTeam(): Team {
  return {
    aussen: [],
    mitte: [],
    zuspieler: [],
    libero: [],
    diagonal: [],
  };
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

export function assignToPositions(
  players: readonly PlayerWithPositions[],
  noLibero: boolean,
): AssignResult {
  const team = emptyTeam();
  const limits = limitsFor(noLibero);

  const sorted = [...players].sort((a, b) => a.positions.length - b.positions.length);

  function backtrack(idx: number): boolean {
    if (idx === sorted.length) return true;
    const p = sorted[idx];
    for (const pos of p.positions) {
      if (noLibero && pos === 'libero') continue;
      if (!POSITION_IDS.includes(pos)) continue;
      if (team[pos].length < limits[pos]) {
        team[pos].push({ name: p.name, position: pos, preferences: p.positions });
        if (backtrack(idx + 1)) return true;
        team[pos].pop();
      }
    }
    return false;
  }

  const success = backtrack(0);
  return { team, skipped: success ? [] : sorted };
}

/**
 * Best-effort placement: tries strict limits first, then overflows the
 * least-loaded preferred position. Only skips when a player has no valid
 * preferred position at all (e.g. pure libero in a noLibero team).
 */
export function assignBestEffort(
  players: readonly PlayerWithPositions[],
  noLibero: boolean,
): AssignResult {
  const team = emptyTeam();
  const limits = limitsFor(noLibero);
  const sorted = [...players].sort((a, b) => a.positions.length - b.positions.length);
  const skipped: PlayerWithPositions[] = [];

  for (const p of sorted) {
    const validPositions = p.positions.filter(
      (pos) => POSITION_IDS.includes(pos) && !(noLibero && pos === 'libero'),
    );
    if (validPositions.length === 0) {
      skipped.push(p);
      continue;
    }

    let target: Position | null = null;
    for (const pos of validPositions) {
      if (team[pos].length < limits[pos]) {
        target = pos;
        break;
      }
    }
    if (target === null) {
      let bestCount = Infinity;
      for (const pos of validPositions) {
        if (team[pos].length < bestCount) {
          bestCount = team[pos].length;
          target = pos;
        }
      }
    }
    if (target) {
      team[target].push({ name: p.name, position: target, preferences: p.positions });
    } else {
      skipped.push(p);
    }
  }

  return { team, skipped };
}
