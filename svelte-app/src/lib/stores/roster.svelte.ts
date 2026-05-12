import { STORAGE_KEYS, POSITION_IDS, MODES, type Mode, type Position } from '../constants';
import { getDefaultStorage } from './storage';
import type { SettingsStore } from './settings.svelte';
import type { AssignmentsStore } from './assignments.svelte';

export type Roster = {
  name: string;
  mode: Mode;
  assignments: Record<Position, string[]>;
  simpleList: string[];
  teamSize: number;
  team1NoLibero: boolean;
  team2NoLibero: boolean;
  updatedAt: number;
};

export type RosterMap = Record<string, Roster>;

function emptyPositions(): Record<Position, string[]> {
  return { aussen: [], mitte: [], zuspieler: [], libero: [], diagonal: [] };
}

function isValidPositions(value: unknown): value is Record<Position, string[]> {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  for (const pos of POSITION_IDS) {
    if (!Array.isArray(obj[pos])) return false;
  }
  return true;
}

function sanitizeRoster(name: string, raw: unknown): Roster | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const mode = r.mode === MODES.simple ? MODES.simple : MODES.positions;
  const assignments = isValidPositions(r.assignments) ? r.assignments : emptyPositions();
  const simpleList = Array.isArray(r.simpleList)
    ? (r.simpleList as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];
  return {
    name,
    mode,
    assignments,
    simpleList,
    teamSize: typeof r.teamSize === 'number' ? r.teamSize : 6,
    team1NoLibero: r.team1NoLibero === true,
    team2NoLibero: r.team2NoLibero === true,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : Date.now(),
  };
}

export class RosterStore {
  private inner = $state<RosterMap>({});
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = getDefaultStorage()) {
    this.storage = storage;
    this.hydrate();
  }

  private hydrate() {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(STORAGE_KEYS.rosters);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      for (const [name, value] of Object.entries(parsed)) {
        const sanitized = sanitizeRoster(name, value);
        if (sanitized) this.inner[name] = sanitized;
      }
    } catch {
      // corrupt → keep empty
    }
  }

  private persist() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEYS.rosters, JSON.stringify(this.inner));
    } catch {
      // ignore
    }
  }

  get names(): readonly string[] {
    return Object.keys(this.inner).sort();
  }

  get count(): number {
    return Object.keys(this.inner).length;
  }

  has(name: string): boolean {
    return name in this.inner;
  }

  get(name: string): Roster | null {
    return this.inner[name] ?? null;
  }

  saveFromStores(name: string, settings: SettingsStore, assignments: AssignmentsStore): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const cloned: Record<Position, string[]> = emptyPositions();
    for (const pos of POSITION_IDS) {
      cloned[pos] = [...assignments.positions[pos]];
    }
    this.inner[trimmed] = {
      name: trimmed,
      mode: settings.mode,
      assignments: cloned,
      simpleList: [...assignments.simpleList],
      teamSize: settings.teamSize,
      team1NoLibero: settings.team1NoLibero,
      team2NoLibero: settings.team2NoLibero,
      updatedAt: Date.now(),
    };
    this.persist();
    return true;
  }

  applyToStores(name: string, settings: SettingsStore, assignments: AssignmentsStore): boolean {
    const roster = this.inner[name];
    if (!roster) return false;
    settings.mode = roster.mode;
    settings.teamSize = roster.teamSize;
    settings.team1NoLibero = roster.team1NoLibero;
    settings.team2NoLibero = roster.team2NoLibero;
    assignments.clearAll();
    for (const pos of POSITION_IDS) {
      for (const playerName of roster.assignments[pos]) {
        assignments.addToPosition(pos, playerName);
      }
    }
    assignments.setSimpleList(roster.simpleList);
    return true;
  }

  delete(name: string): boolean {
    if (!(name in this.inner)) return false;
    delete this.inner[name];
    this.persist();
    return true;
  }

  clear() {
    for (const name of Object.keys(this.inner)) delete this.inner[name];
    this.persist();
  }
}

export const rosters = new RosterStore();
