import { beforeEach, describe, expect, it } from 'vitest';
import { migrate } from './migrations';
import { STORAGE_KEYS } from './constants';
import { FakeStorage } from './test-utils/fake-storage';

let storage: FakeStorage;

beforeEach(() => {
  storage = new FakeStorage();
});

const getJSON = <T>(key: string): T | null => {
  const raw = storage.getItem(key);
  if (raw == null) return null;
  return JSON.parse(raw) as T;
};

describe('migrate v1→v2', () => {
  it('returns ran=true on empty storage but no keys migrated', () => {
    const report = migrate(storage);
    expect(report.ran).toBe(true);
    expect(report.migratedKeys).toEqual([]);
    expect(report.historyReset).toBe(false);
  });

  it('is idempotent — second run does nothing', () => {
    storage.setItem('vb_aussen', 'Quang\nAnh');
    const first = migrate(storage);
    const second = migrate(storage);
    expect(first.ran).toBe(true);
    expect(first.migratedKeys).toContain(STORAGE_KEYS.assignments);
    expect(second.ran).toBe(false);
    expect(second.migratedKeys).toEqual([]);
  });

  it('migrates position keys into vb_assignments_v2 (flatten + trim)', () => {
    storage.setItem('vb_aussen', 'Quang\nAnh\n\n  Erik  ');
    storage.setItem('vb_mitte', 'Tom');
    storage.setItem('vb_zuspieler', '');
    migrate(storage);
    const assignments = getJSON<Record<string, string[]>>(STORAGE_KEYS.assignments);
    expect(assignments).toEqual({
      aussen: ['Quang', 'Anh', 'Erik'],
      mitte: ['Tom'],
      zuspieler: [],
      libero: [],
      diagonal: [],
    });
  });

  it('removes old v1 position keys after migration', () => {
    storage.setItem('vb_aussen', 'Quang');
    storage.setItem('vb_libero', 'Tom');
    migrate(storage);
    expect(storage.getItem('vb_aussen')).toBeNull();
    expect(storage.getItem('vb_libero')).toBeNull();
  });

  it('migrates settings keys into vb_settings_v2 with clamping', () => {
    storage.setItem('vb_team_size', '15');
    storage.setItem('vb_team1_no_libero', 'true');
    storage.setItem('vb_team2_no_libero', 'false');
    migrate(storage);
    const settings = getJSON<{ teamSize: number; team1NoLibero: boolean; team2NoLibero: boolean }>(
      STORAGE_KEYS.settings,
    );
    expect(settings?.teamSize).toBe(12);
    expect(settings?.team1NoLibero).toBe(true);
    expect(settings?.team2NoLibero).toBe(false);
  });

  it('migrates rosters into vb_rosters_v2 with typed structure', () => {
    const oldRosters = {
      Sommer: {
        aussen: 'Quang\nAnh',
        mitte: 'Tom',
        zuspieler: '',
        libero: 'Erik',
        diagonal: '',
        teamSize: '6',
        team1NoLibero: false,
        team2NoLibero: false,
      },
    };
    storage.setItem('vb_rosters', JSON.stringify(oldRosters));
    migrate(storage);
    const rosters = getJSON<Record<string, { assignments: Record<string, string[]>; teamSize: number; mode: string }>>(
      STORAGE_KEYS.rosters,
    );
    expect(rosters?.Sommer.mode).toBe('positions');
    expect(rosters?.Sommer.assignments.aussen).toEqual(['Quang', 'Anh']);
    expect(rosters?.Sommer.assignments.libero).toEqual(['Erik']);
    expect(rosters?.Sommer.teamSize).toBe(6);
  });

  it('migrates vb_pool to vb_pool_v2 (deduped + trimmed)', () => {
    storage.setItem('vb_pool', JSON.stringify(['Quang', '  Anh ', 'Quang', '', 'Tom']));
    migrate(storage);
    const pool = getJSON<string[]>(STORAGE_KEYS.pool);
    expect(pool).toEqual(['Quang', 'Anh', 'Tom']);
  });

  it('reports historyReset=true when vb_history existed', () => {
    storage.setItem('vb_history', JSON.stringify([{ time: 'x', team1: [], team2: [] }]));
    const report = migrate(storage);
    expect(report.historyReset).toBe(true);
    expect(storage.getItem('vb_history')).toBeNull();
  });

  it('reports historyReset=false when no history existed', () => {
    const report = migrate(storage);
    expect(report.historyReset).toBe(false);
  });

  it('writes vb_migrations marker after running', () => {
    migrate(storage);
    const marker = getJSON<{ v2: boolean }>(STORAGE_KEYS.migrations);
    expect(marker?.v2).toBe(true);
  });

  it('handles corrupt JSON gracefully (rosters)', () => {
    storage.setItem('vb_rosters', '{not valid json');
    expect(() => migrate(storage)).not.toThrow();
    expect(storage.getItem('vb_rosters')).toBeNull();
  });

  it('handles corrupt JSON gracefully (pool)', () => {
    storage.setItem('vb_pool', '[invalid');
    expect(() => migrate(storage)).not.toThrow();
    expect(storage.getItem('vb_pool')).toBeNull();
  });

  it('handles partial v1 state (only some keys present)', () => {
    storage.setItem('vb_aussen', 'Quang');
    const report = migrate(storage);
    expect(report.ran).toBe(true);
    expect(report.migratedKeys).toEqual([STORAGE_KEYS.assignments]);
    expect(getJSON<Record<string, string[]>>(STORAGE_KEYS.assignments)?.aussen).toEqual(['Quang']);
    expect(storage.getItem(STORAGE_KEYS.settings)).toBeNull();
  });

  it('preserves vb_lang unchanged (KEEP per migration table)', () => {
    storage.setItem('vb_lang', 'en');
    migrate(storage);
    expect(storage.getItem('vb_lang')).toBe('en');
  });

  it('clamps teamSize=0 to default 6', () => {
    storage.setItem('vb_team_size', '0');
    migrate(storage);
    const settings = getJSON<{ teamSize: number }>(STORAGE_KEYS.settings);
    expect(settings?.teamSize).toBe(6);
  });

  it('handles non-numeric teamSize ("abc") with default', () => {
    storage.setItem('vb_team_size', 'abc');
    migrate(storage);
    const settings = getJSON<{ teamSize: number }>(STORAGE_KEYS.settings);
    expect(settings?.teamSize).toBe(6);
  });
});
