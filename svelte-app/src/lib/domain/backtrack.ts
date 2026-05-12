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

export function assignToPositions(
  players: readonly PlayerWithPositions[],
  noLibero: boolean,
): AssignResult {
  const team = emptyTeam();
  const limits = {
    aussen: POSITION_META.aussen.max,
    mitte: POSITION_META.mitte.max,
    zuspieler: POSITION_META.zuspieler.max,
    libero: noLibero ? 0 : POSITION_META.libero.max,
    diagonal: POSITION_META.diagonal.max,
  } satisfies Record<Position, number>;

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
