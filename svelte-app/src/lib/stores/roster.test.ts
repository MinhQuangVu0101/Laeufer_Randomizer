import { beforeEach, describe, expect, it } from 'vitest';
import { RosterStore } from './roster.svelte';
import { SettingsStore } from './settings.svelte';
import { AssignmentsStore } from './assignments.svelte';
import { FakeStorage } from '../test-utils/fake-storage';
import { STORAGE_KEYS } from '../constants';

let storage: FakeStorage;
let settings: SettingsStore;
let assignments: AssignmentsStore;
let rosters: RosterStore;

beforeEach(() => {
  storage = new FakeStorage();
  settings = new SettingsStore(storage);
  assignments = new AssignmentsStore(storage);
  rosters = new RosterStore(storage);
});

describe('RosterStore', () => {
  it('starts empty', () => {
    expect(rosters.count).toBe(0);
    expect(rosters.names).toEqual([]);
  });

  it('saveFromStores captures current settings + assignments', () => {
    settings.mode = 'positions';
    settings.teamSize = 8;
    settings.team1NoLibero = true;
    assignments.addToPosition('aussen', 'Quang');
    assignments.addToPosition('mitte', 'Anh');
    rosters.saveFromStores('SommerCup', settings, assignments);
    const r = rosters.get('SommerCup');
    expect(r).not.toBeNull();
    expect(r?.mode).toBe('positions');
    expect(r?.teamSize).toBe(8);
    expect(r?.team1NoLibero).toBe(true);
    expect(r?.assignments.aussen).toEqual(['Quang']);
    expect(r?.assignments.mitte).toEqual(['Anh']);
  });

  it('saveFromStores trims roster name', () => {
    rosters.saveFromStores('  Sommer  ', settings, assignments);
    expect(rosters.has('Sommer')).toBe(true);
    expect(rosters.has('  Sommer  ')).toBe(false);
  });

  it('saveFromStores rejects empty name', () => {
    expect(rosters.saveFromStores('', settings, assignments)).toBe(false);
    expect(rosters.saveFromStores('   ', settings, assignments)).toBe(false);
    expect(rosters.count).toBe(0);
  });

  it('applyToStores restores settings + assignments', () => {
    settings.teamSize = 8;
    settings.team1NoLibero = true;
    assignments.addToPosition('aussen', 'Quang');
    assignments.addToPosition('libero', 'Erik');
    rosters.saveFromStores('SommerCup', settings, assignments);

    settings.teamSize = 6;
    settings.team1NoLibero = false;
    assignments.clearAll();
    expect(assignments.countAssignedInPositions()).toBe(0);

    rosters.applyToStores('SommerCup', settings, assignments);
    expect(settings.teamSize).toBe(8);
    expect(settings.team1NoLibero).toBe(true);
    expect(assignments.positions.aussen).toEqual(['Quang']);
    expect(assignments.positions.libero).toEqual(['Erik']);
  });

  it('applyToStores returns false for unknown roster', () => {
    expect(rosters.applyToStores('Nonexistent', settings, assignments)).toBe(false);
  });

  it('delete removes roster', () => {
    rosters.saveFromStores('X', settings, assignments);
    expect(rosters.delete('X')).toBe(true);
    expect(rosters.has('X')).toBe(false);
  });

  it('delete returns false for non-existent', () => {
    expect(rosters.delete('Ghost')).toBe(false);
  });

  it('names returns sorted', () => {
    rosters.saveFromStores('Zebra', settings, assignments);
    rosters.saveFromStores('Alpha', settings, assignments);
    rosters.saveFromStores('Mango', settings, assignments);
    expect(rosters.names).toEqual(['Alpha', 'Mango', 'Zebra']);
  });

  it('saving same name overwrites', () => {
    assignments.addToPosition('aussen', 'A');
    rosters.saveFromStores('X', settings, assignments);
    assignments.clearAll();
    assignments.addToPosition('mitte', 'B');
    rosters.saveFromStores('X', settings, assignments);
    expect(rosters.get('X')?.assignments.aussen).toEqual([]);
    expect(rosters.get('X')?.assignments.mitte).toEqual(['B']);
  });

  it('persists across instances', () => {
    rosters.saveFromStores('Persisted', settings, assignments);
    const fresh = new RosterStore(storage);
    expect(fresh.has('Persisted')).toBe(true);
  });

  it('ignores corrupt roster entries during hydrate', () => {
    storage.setItem(
      STORAGE_KEYS.rosters,
      JSON.stringify({ Good: { mode: 'positions', teamSize: 4 }, Bad: 'not-an-object' }),
    );
    const fresh = new RosterStore(storage);
    expect(fresh.has('Good')).toBe(true);
    expect(fresh.has('Bad')).toBe(false);
  });

  it('clear removes all rosters', () => {
    rosters.saveFromStores('A', settings, assignments);
    rosters.saveFromStores('B', settings, assignments);
    rosters.clear();
    expect(rosters.count).toBe(0);
  });

  it('round-trips simple mode roster with simpleList', () => {
    settings.mode = 'simple';
    assignments.setSimpleList(['Q', 'A', 'E']);
    rosters.saveFromStores('Quick', settings, assignments);
    assignments.clearAll();
    settings.mode = 'positions';
    rosters.applyToStores('Quick', settings, assignments);
    expect(settings.mode).toBe('simple');
    expect([...assignments.simpleList].sort()).toEqual(['A', 'E', 'Q']);
  });
});
