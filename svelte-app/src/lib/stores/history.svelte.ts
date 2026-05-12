import { POSITION_IDS, type Position } from '../constants';
import type { GenerationResult } from '../domain/types';
import { getDefaultStorage } from './storage';

const HISTORY_KEY = 'vb_history_v2';
const MAX_ENTRIES = 3;

export type HistoryEntry = {
  time: number;
  mode: 'positions' | 'simple';
  team1: string;
  team2: string;
  bench: string;
};

function formatPositionTeam(team: Record<Position, { name: string }[]>): string {
  const parts: string[] = [];
  for (const pos of POSITION_IDS) {
    const players = team[pos];
    if (players.length === 0) continue;
    parts.push(`${pos}: ${players.map((p) => p.name).join(', ')}`);
  }
  return parts.join(' | ');
}

function formatSimpleTeam(team: readonly string[]): string {
  return team.join(', ');
}

export function entryFromResult(result: GenerationResult): HistoryEntry | null {
  if (!result.ok) return null;
  if (result.mode === 'positions') {
    return {
      time: Date.now(),
      mode: 'positions',
      team1: formatPositionTeam(result.team1),
      team2: formatPositionTeam(result.team2),
      bench: result.bench.map((b) => b.name).join(', '),
    };
  }
  return {
    time: Date.now(),
    mode: 'simple',
    team1: formatSimpleTeam(result.team1),
    team2: formatSimpleTeam(result.team2),
    bench: formatSimpleTeam(result.bench),
  };
}

export class HistoryStore {
  private inner = $state<HistoryEntry[]>([]);
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = getDefaultStorage()) {
    this.storage = storage;
    this.hydrate();
  }

  private hydrate() {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      this.inner.length = 0;
      for (const e of parsed.slice(0, MAX_ENTRIES)) {
        if (
          e &&
          typeof e === 'object' &&
          typeof e.time === 'number' &&
          (e.mode === 'positions' || e.mode === 'simple') &&
          typeof e.team1 === 'string' &&
          typeof e.team2 === 'string' &&
          typeof e.bench === 'string'
        ) {
          this.inner.push(e);
        }
      }
    } catch {
      // corrupt → keep empty
    }
  }

  private persist() {
    if (!this.storage) return;
    try {
      this.storage.setItem(HISTORY_KEY, JSON.stringify(this.inner));
    } catch {
      // ignore
    }
  }

  get all(): readonly HistoryEntry[] {
    return this.inner;
  }

  get isEmpty(): boolean {
    return this.inner.length === 0;
  }

  add(result: GenerationResult): boolean {
    const entry = entryFromResult(result);
    if (!entry) return false;
    this.inner.unshift(entry);
    while (this.inner.length > MAX_ENTRIES) this.inner.pop();
    this.persist();
    return true;
  }

  clear() {
    this.inner.length = 0;
    this.persist();
  }
}

export const history = new HistoryStore();
