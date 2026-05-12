import {
  STORAGE_KEYS,
  DEFAULT_TEAM_SIZE,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
  POSITION_IDS,
  type Position,
} from './constants';

const V1_POSITION_KEYS: Record<Position, string> = {
  aussen: 'vb_aussen',
  mitte: 'vb_mitte',
  zuspieler: 'vb_zuspieler',
  libero: 'vb_libero',
  diagonal: 'vb_diagonal',
};

const V1_KEY_TEAM_SIZE = 'vb_team_size';
const V1_KEY_T1_NO_LIB = 'vb_team1_no_libero';
const V1_KEY_T2_NO_LIB = 'vb_team2_no_libero';
const V1_KEY_ROSTERS = 'vb_rosters';
const V1_KEY_POOL = 'vb_pool';
const V1_KEY_HISTORY = 'vb_history';

type MigrationsMarker = { v2?: boolean };

export type MigrationReport = {
  ran: boolean;
  migratedKeys: string[];
  historyReset: boolean;
};

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function clampTeamSize(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n)) return DEFAULT_TEAM_SIZE;
  const rounded = Math.floor(n);
  if (rounded < MIN_TEAM_SIZE) return DEFAULT_TEAM_SIZE;
  return Math.min(rounded, MAX_TEAM_SIZE);
}

function parseLines(value: string | null): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function getMarker(storage: Storage): MigrationsMarker {
  return safeParse<MigrationsMarker>(safeGet(storage, STORAGE_KEYS.migrations), {});
}

export function migrate(storage: Storage = localStorage): MigrationReport {
  const marker = getMarker(storage);
  if (marker.v2) {
    return { ran: false, migratedKeys: [], historyReset: false };
  }

  const migratedKeys: string[] = [];
  let historyReset = false;

  const assignments: Record<Position, string[]> = {
    aussen: [],
    mitte: [],
    zuspieler: [],
    libero: [],
    diagonal: [],
  };
  let hasAssignments = false;
  for (const pos of POSITION_IDS) {
    const raw = safeGet(storage, V1_POSITION_KEYS[pos]);
    const names = parseLines(raw);
    if (names.length > 0) {
      assignments[pos] = names;
      hasAssignments = true;
    }
  }
  if (hasAssignments) {
    storage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
    migratedKeys.push(STORAGE_KEYS.assignments);
  }

  const oldTeamSize = safeGet(storage, V1_KEY_TEAM_SIZE);
  const oldT1NoLib = safeGet(storage, V1_KEY_T1_NO_LIB);
  const oldT2NoLib = safeGet(storage, V1_KEY_T2_NO_LIB);
  const hasSettings = oldTeamSize !== null || oldT1NoLib !== null || oldT2NoLib !== null;
  if (hasSettings) {
    const settings = {
      mode: 'positions' as const,
      teamSize: oldTeamSize !== null ? clampTeamSize(Number(oldTeamSize)) : DEFAULT_TEAM_SIZE,
      team1NoLibero: oldT1NoLib === 'true',
      team2NoLibero: oldT2NoLib === 'true',
    };
    storage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    migratedKeys.push(STORAGE_KEYS.settings);
  }

  const oldRostersRaw = safeGet(storage, V1_KEY_ROSTERS);
  if (oldRostersRaw !== null) {
    const oldRosters = safeParse<Record<string, Record<string, unknown>>>(oldRostersRaw, {});
    const newRosters: Record<string, unknown> = {};
    const now = Date.now();
    for (const [name, raw] of Object.entries(oldRosters)) {
      if (!raw || typeof raw !== 'object') continue;
      const rosterAssignments: Record<Position, string[]> = {
        aussen: [],
        mitte: [],
        zuspieler: [],
        libero: [],
        diagonal: [],
      };
      for (const pos of POSITION_IDS) {
        const value = raw[pos];
        if (typeof value === 'string') {
          rosterAssignments[pos] = parseLines(value);
        }
      }
      const teamSizeRaw = raw.teamSize;
      const teamSize =
        typeof teamSizeRaw === 'string' || typeof teamSizeRaw === 'number'
          ? clampTeamSize(Number(teamSizeRaw))
          : DEFAULT_TEAM_SIZE;
      newRosters[name] = {
        mode: 'positions' as const,
        assignments: rosterAssignments,
        simpleList: [] as string[],
        teamSize,
        team1NoLibero: raw.team1NoLibero === true,
        team2NoLibero: raw.team2NoLibero === true,
        updatedAt: now,
      };
    }
    storage.setItem(STORAGE_KEYS.rosters, JSON.stringify(newRosters));
    migratedKeys.push(STORAGE_KEYS.rosters);
  }

  const oldPoolRaw = safeGet(storage, V1_KEY_POOL);
  if (oldPoolRaw !== null) {
    const pool = safeParse<string[]>(oldPoolRaw, []);
    if (Array.isArray(pool)) {
      const cleaned = pool
        .filter((x): x is string => typeof x === 'string')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const deduped = [...new Set(cleaned)];
      storage.setItem(STORAGE_KEYS.pool, JSON.stringify(deduped));
      migratedKeys.push(STORAGE_KEYS.pool);
    }
  }

  if (safeGet(storage, V1_KEY_HISTORY) !== null) {
    historyReset = true;
  }

  for (const pos of POSITION_IDS) storage.removeItem(V1_POSITION_KEYS[pos]);
  storage.removeItem(V1_KEY_TEAM_SIZE);
  storage.removeItem(V1_KEY_T1_NO_LIB);
  storage.removeItem(V1_KEY_T2_NO_LIB);
  storage.removeItem(V1_KEY_ROSTERS);
  storage.removeItem(V1_KEY_POOL);
  storage.removeItem(V1_KEY_HISTORY);

  storage.setItem(STORAGE_KEYS.migrations, JSON.stringify({ v2: true }));

  return { ran: true, migratedKeys, historyReset };
}
