import { describe, expect, it, vi } from 'vitest';
import { SettingsStore } from '../stores/settings.svelte';
import { PoolStore } from '../stores/pool.svelte';
import { AssignmentsStore } from '../stores/assignments.svelte';
import { RosterStore } from '../stores/roster.svelte';
import { FakeStorage } from '../test-utils/fake-storage';
import { applyRemoteToLocal, mergeRemoteWithLocal, summarizeLocal } from './sync';
import type { RemoteSnapshot } from './sync';
import type { RosterRow, SettingsRow } from './supabase';

const baseSettingsRow = (overrides: Partial<SettingsRow> = {}): SettingsRow => ({
  user_id: 'user-1',
  mode: 'positions',
  theme: 'dark',
  lang: 'de',
  team_size: 6,
  team1_no_libero: false,
  team2_no_libero: false,
  pool: ['Quang', 'Anh'],
  assignments: { aussen: ['Quang'], mitte: [], zuspieler: [], libero: [], diagonal: [] },
  simple_list: [],
  updated_at: new Date().toISOString(),
  ...overrides,
});

const rosterRow = (overrides: Partial<RosterRow> = {}): RosterRow => ({
  id: '00000000-0000-0000-0000-000000000001',
  user_id: 'user-1',
  name: 'SommerCup',
  data: {
    mode: 'positions',
    assignments: { aussen: ['Erik'], mitte: [], zuspieler: [], libero: [], diagonal: [] },
    simpleList: [],
    teamSize: 6,
    team1NoLibero: false,
    team2NoLibero: false,
  },
  updated_at: new Date().toISOString(),
  ...overrides,
});

function freshStores() {
  const storage = new FakeStorage();
  return {
    settings: new SettingsStore(storage),
    pool: new PoolStore(storage),
    assignments: new AssignmentsStore(storage),
    rosters: new RosterStore(storage),
  };
}

describe('summarizeLocal', () => {
  it('reports local state for the sync wizard', () => {
    const s = freshStores();
    s.rosters.saveFromStores('A', s.settings, s.assignments);
    s.rosters.saveFromStores('B', s.settings, s.assignments);
    const summary = summarizeLocal(s.settings, s.rosters);
    expect(summary.rosterCount).toBe(2);
    expect([...summary.rosterNames].sort()).toEqual(['A', 'B']);
  });
});

describe('applyRemoteToLocal', () => {
  it('applies remote settings onto local stores', () => {
    const s = freshStores();
    const snapshot: RemoteSnapshot = {
      settings: baseSettingsRow({ team_size: 8, lang: 'en', mode: 'simple', simple_list: ['X'] }),
      rosters: [],
    };
    applyRemoteToLocal(snapshot, s.settings, s.pool, s.assignments, s.rosters);
    expect(s.settings.teamSize).toBe(8);
    expect(s.settings.lang).toBe('en');
    expect(s.settings.mode).toBe('simple');
    expect([...s.assignments.simpleList]).toEqual(['X']);
  });

  it('replaces local pool with remote pool', () => {
    const s = freshStores();
    s.pool.add('LocalOnly');
    const snapshot: RemoteSnapshot = {
      settings: baseSettingsRow({ pool: ['Remote1', 'Remote2'] }),
      rosters: [],
    };
    applyRemoteToLocal(snapshot, s.settings, s.pool, s.assignments, s.rosters);
    expect([...s.pool.all].sort()).toEqual(['Remote1', 'Remote2']);
  });

  it('replaces local rosters with remote rosters', () => {
    const s = freshStores();
    s.rosters.saveFromStores('LocalOnly', s.settings, s.assignments);
    const snapshot: RemoteSnapshot = { settings: null, rosters: [rosterRow({ name: 'FromRemote' })] };
    applyRemoteToLocal(snapshot, s.settings, s.pool, s.assignments, s.rosters);
    expect(s.rosters.has('LocalOnly')).toBe(false);
    expect(s.rosters.has('FromRemote')).toBe(true);
  });

  it('clamps invalid team_size during apply', () => {
    const s = freshStores();
    const snapshot: RemoteSnapshot = { settings: baseSettingsRow({ team_size: 99 }), rosters: [] };
    applyRemoteToLocal(snapshot, s.settings, s.pool, s.assignments, s.rosters);
    expect(s.settings.teamSize).toBe(12);
  });

  it('handles missing settings row (rosters-only snapshot)', () => {
    const s = freshStores();
    s.settings.teamSize = 8;
    const snapshot: RemoteSnapshot = { settings: null, rosters: [rosterRow()] };
    applyRemoteToLocal(snapshot, s.settings, s.pool, s.assignments, s.rosters);
    expect(s.settings.teamSize).toBe(8);
    expect(s.rosters.has('SommerCup')).toBe(true);
  });
});

describe('mergeRemoteWithLocal', () => {
  it('keeps local roster when local is newer', () => {
    const s = freshStores();
    s.rosters.saveFromStores('Shared', s.settings, s.assignments);
    const localBefore = s.rosters.get('Shared')!.updatedAt;
    const olderRemote = rosterRow({
      name: 'Shared',
      updated_at: new Date(localBefore - 60_000).toISOString(),
      data: {
        mode: 'positions',
        assignments: { aussen: ['REMOTE'], mitte: [], zuspieler: [], libero: [], diagonal: [] },
        simpleList: [],
        teamSize: 6,
        team1NoLibero: false,
        team2NoLibero: false,
      },
    });
    mergeRemoteWithLocal({ settings: null, rosters: [olderRemote] }, s.settings, s.pool, s.assignments, s.rosters);
    expect(s.rosters.get('Shared')?.assignments.aussen).not.toContain('REMOTE');
  });

  it('replaces local roster when remote is newer', () => {
    const s = freshStores();
    s.rosters.saveFromStores('Shared', s.settings, s.assignments);
    const localBefore = s.rosters.get('Shared')!.updatedAt;
    const newerRemote = rosterRow({
      name: 'Shared',
      updated_at: new Date(localBefore + 60_000).toISOString(),
      data: {
        mode: 'positions',
        assignments: { aussen: ['REMOTE_NEW'], mitte: [], zuspieler: [], libero: [], diagonal: [] },
        simpleList: [],
        teamSize: 6,
        team1NoLibero: false,
        team2NoLibero: false,
      },
    });
    mergeRemoteWithLocal({ settings: null, rosters: [newerRemote] }, s.settings, s.pool, s.assignments, s.rosters);
    expect(s.rosters.get('Shared')?.assignments.aussen).toEqual(['REMOTE_NEW']);
  });

  it('adds remote-only rosters', () => {
    const s = freshStores();
    s.rosters.saveFromStores('LocalOnly', s.settings, s.assignments);
    mergeRemoteWithLocal(
      { settings: null, rosters: [rosterRow({ name: 'RemoteOnly' })] },
      s.settings,
      s.pool,
      s.assignments,
      s.rosters,
    );
    expect(s.rosters.has('LocalOnly')).toBe(true);
    expect(s.rosters.has('RemoteOnly')).toBe(true);
  });
});

describe('PoolStore.replaceAll (sync helper)', () => {
  it('dedupes + trims + replaces', () => {
    const p = new PoolStore(new FakeStorage());
    p.replaceAll(['  Q ', 'Q', 'A', '', 'B']);
    expect([...p.all].sort()).toEqual(['A', 'B', 'Q']);
  });
});

describe('RosterStore.injectRoster (sync helper)', () => {
  it('bypasses normal save flow and writes the roster as-is', () => {
    const r = new RosterStore(new FakeStorage());
    r.injectRoster({
      name: 'Direct',
      mode: 'simple',
      assignments: { aussen: [], mitte: [], zuspieler: [], libero: [], diagonal: [] },
      simpleList: ['A', 'B'],
      teamSize: 4,
      team1NoLibero: false,
      team2NoLibero: false,
      updatedAt: 12345,
    });
    expect(r.get('Direct')?.simpleList).toEqual(['A', 'B']);
    expect(r.get('Direct')?.teamSize).toBe(4);
  });
});

// Mock the supabase module so we can test pullRemoteSnapshot + pushLocalToRemote without a real client
vi.mock('./supabase', async () => {
  const actual = await vi.importActual<typeof import('./supabase')>('./supabase');
  return {
    ...actual,
    supabase: null,
  };
});

describe('sync against missing Supabase config', () => {
  it('pull throws when supabase is null', async () => {
    const { pullRemoteSnapshot, SyncError } = await import('./sync');
    await expect(pullRemoteSnapshot('user-1')).rejects.toBeInstanceOf(SyncError);
  });

  it('push throws when supabase is null', async () => {
    const { pushLocalToRemote, SyncError } = await import('./sync');
    const s = freshStores();
    await expect(pushLocalToRemote('user-1', s.settings, s.pool, s.assignments, s.rosters)).rejects.toBeInstanceOf(
      SyncError,
    );
  });
});
