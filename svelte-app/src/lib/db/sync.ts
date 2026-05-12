import { POSITION_IDS, type Position } from '../constants';
import { supabase, type SettingsRow, type RosterRow } from './supabase';
import type { SettingsStore } from '../stores/settings.svelte';
import type { PoolStore } from '../stores/pool.svelte';
import type { AssignmentsStore } from '../stores/assignments.svelte';
import type { RosterStore } from '../stores/roster.svelte';

export type RemoteSnapshot = {
  settings: SettingsRow | null;
  rosters: RosterRow[];
};

export type LocalSnapshot = {
  hasSettings: boolean;
  rosterNames: string[];
  rosterCount: number;
};

export type SyncDecision = 'pull' | 'push' | 'merge' | 'cancel';

export class SyncError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
  }
}

function ensureSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new SyncError('Supabase not configured');
  return supabase;
}

function emptyPositions(): Record<Position, string[]> {
  return { aussen: [], mitte: [], zuspieler: [], libero: [], diagonal: [] };
}

export async function pullRemoteSnapshot(userId: string): Promise<RemoteSnapshot> {
  const sb = ensureSupabase();
  const [settingsRes, rostersRes] = await Promise.all([
    sb.from('settings').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('rosters').select('*').eq('user_id', userId),
  ]);
  if (settingsRes.error) throw new SyncError(settingsRes.error.message, settingsRes.error);
  if (rostersRes.error) throw new SyncError(rostersRes.error.message, rostersRes.error);
  return {
    settings: (settingsRes.data as SettingsRow | null) ?? null,
    rosters: (rostersRes.data as RosterRow[]) ?? [],
  };
}

export function summarizeLocal(
  settings: SettingsStore,
  rosters: RosterStore,
): LocalSnapshot {
  return {
    hasSettings: true,
    rosterNames: [...rosters.names],
    rosterCount: rosters.count,
  };
}

export async function pushLocalToRemote(
  userId: string,
  settings: SettingsStore,
  pool: PoolStore,
  assignments: AssignmentsStore,
  rosters: RosterStore,
): Promise<void> {
  const sb = ensureSupabase();

  const settingsPayload = {
    user_id: userId,
    mode: settings.mode,
    theme: settings.theme,
    lang: settings.lang,
    team_size: settings.teamSize,
    team1_no_libero: settings.team1NoLibero,
    team2_no_libero: settings.team2NoLibero,
    pool: [...pool.all],
    assignments: { ...assignments.positions },
    simple_list: [...assignments.simpleList],
    updated_at: new Date().toISOString(),
  };

  const { error: settingsErr } = await sb.from('settings').upsert(settingsPayload, {
    onConflict: 'user_id',
  });
  if (settingsErr) throw new SyncError(settingsErr.message, settingsErr);

  const rosterRows = rosters.names.map((name) => {
    const r = rosters.get(name);
    if (!r) throw new SyncError(`Local roster vanished: ${name}`);
    return {
      user_id: userId,
      name: r.name,
      data: {
        mode: r.mode,
        assignments: r.assignments,
        simpleList: r.simpleList,
        teamSize: r.teamSize,
        team1NoLibero: r.team1NoLibero,
        team2NoLibero: r.team2NoLibero,
      },
      updated_at: new Date(r.updatedAt).toISOString(),
    };
  });

  if (rosterRows.length > 0) {
    const { error } = await sb.from('rosters').upsert(rosterRows, {
      onConflict: 'user_id,name',
    });
    if (error) throw new SyncError(error.message, error);
  }
}

export function applyRemoteToLocal(
  snapshot: RemoteSnapshot,
  settings: SettingsStore,
  pool: PoolStore,
  assignments: AssignmentsStore,
  rosters: RosterStore,
): void {
  const s = snapshot.settings;
  if (s) {
    settings.mode = s.mode === 'simple' ? 'simple' : 'positions';
    settings.theme = s.theme === 'light' ? 'light' : 'dark';
    settings.lang = s.lang === 'en' ? 'en' : 'de';
    settings.teamSize = s.team_size;
    settings.team1NoLibero = s.team1_no_libero;
    settings.team2NoLibero = s.team2_no_libero;

    if (Array.isArray(s.pool)) {
      pool.resetToDefaults();
      const fresh = (s.pool as unknown[]).filter((x): x is string => typeof x === 'string');
      pool.replaceAll(fresh);
    }

    assignments.clearAll();
    const rawAssignments = (s.assignments as Record<string, unknown>) ?? {};
    for (const pos of POSITION_IDS) {
      const list = rawAssignments[pos];
      if (Array.isArray(list)) {
        for (const name of list) {
          if (typeof name === 'string') assignments.addToPosition(pos, name);
        }
      }
    }
    if (Array.isArray(s.simple_list)) {
      assignments.setSimpleList(
        (s.simple_list as unknown[]).filter((x): x is string => typeof x === 'string'),
      );
    }
  }

  rosters.clear();
  for (const r of snapshot.rosters) {
    const data = r.data ?? {};
    const assignmentsRecord =
      typeof data.assignments === 'object' && data.assignments !== null
        ? (data.assignments as Record<string, unknown>)
        : {};
    const cloneAssignments: Record<Position, string[]> = emptyPositions();
    for (const pos of POSITION_IDS) {
      const list = assignmentsRecord[pos];
      if (Array.isArray(list)) {
        cloneAssignments[pos] = list.filter((x): x is string => typeof x === 'string');
      }
    }
    rosters.injectRoster({
      name: r.name,
      mode: data.mode === 'simple' ? 'simple' : 'positions',
      assignments: cloneAssignments,
      simpleList: Array.isArray(data.simpleList)
        ? data.simpleList.filter((x): x is string => typeof x === 'string')
        : [],
      teamSize: typeof data.teamSize === 'number' ? data.teamSize : 6,
      team1NoLibero: data.team1NoLibero === true,
      team2NoLibero: data.team2NoLibero === true,
      updatedAt: new Date(r.updated_at).getTime(),
    });
  }
}

function injectRemoteRoster(row: RosterRow, rosters: RosterStore): void {
  const data = row.data ?? {};
  const assignmentsRecord =
    typeof data.assignments === 'object' && data.assignments !== null
      ? (data.assignments as Record<string, unknown>)
      : {};
  const cloneAssignments: Record<Position, string[]> = emptyPositions();
  for (const pos of POSITION_IDS) {
    const list = assignmentsRecord[pos];
    if (Array.isArray(list)) {
      cloneAssignments[pos] = list.filter((x): x is string => typeof x === 'string');
    }
  }
  rosters.injectRoster({
    name: row.name,
    mode: data.mode === 'simple' ? 'simple' : 'positions',
    assignments: cloneAssignments,
    simpleList: Array.isArray(data.simpleList)
      ? data.simpleList.filter((x): x is string => typeof x === 'string')
      : [],
    teamSize: typeof data.teamSize === 'number' ? data.teamSize : 6,
    team1NoLibero: data.team1NoLibero === true,
    team2NoLibero: data.team2NoLibero === true,
    updatedAt: new Date(row.updated_at).getTime(),
  });
}

export function mergeRemoteWithLocal(
  snapshot: RemoteSnapshot,
  _settings: SettingsStore,
  _pool: PoolStore,
  _assignments: AssignmentsStore,
  rosters: RosterStore,
): void {
  for (const remote of snapshot.rosters) {
    const local = rosters.get(remote.name);
    const remoteAge = new Date(remote.updated_at).getTime();
    if (!local) {
      injectRemoteRoster(remote, rosters);
      continue;
    }
    if (remoteAge > local.updatedAt) {
      injectRemoteRoster(remote, rosters);
    }
  }
}
