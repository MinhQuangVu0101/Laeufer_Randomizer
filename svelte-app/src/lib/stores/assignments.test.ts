import { describe, expect, it } from 'vitest';
import { AssignmentsStore } from './assignments.svelte';
import { FakeStorage } from '../test-utils/fake-storage';
import { STORAGE_KEYS } from '../constants';

const makeStore = () => new AssignmentsStore(new FakeStorage());

describe('AssignmentsStore', () => {
  it('starts with empty positions and simpleList', () => {
    const a = makeStore();
    expect(a.countAssignedInPositions()).toBe(0);
    expect(a.simpleList.length).toBe(0);
  });

  it('addToPosition appends name and returns true', () => {
    const a = makeStore();
    expect(a.addToPosition('aussen', 'Quang')).toBe(true);
    expect(a.positions.aussen).toEqual(['Quang']);
  });

  it('addToPosition allows same name in multiple positions (flex player)', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'Quang');
    expect(a.addToPosition('mitte', 'Quang')).toBe(true);
    expect(a.positions.aussen).toEqual(['Quang']);
    expect(a.positions.mitte).toEqual(['Quang']);
  });

  it('addToPosition rejects duplicate in same position', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'Quang');
    expect(a.addToPosition('aussen', 'Quang')).toBe(false);
    expect(a.positions.aussen).toEqual(['Quang']);
  });

  it('addToPosition rejects empty/whitespace', () => {
    const a = makeStore();
    expect(a.addToPosition('aussen', '')).toBe(false);
    expect(a.addToPosition('aussen', '   ')).toBe(false);
  });

  it('removeFromPosition removes and returns true', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'Quang');
    expect(a.removeFromPosition('aussen', 'Quang')).toBe(true);
    expect(a.positions.aussen).toEqual([]);
  });

  it('movePosition moves name between positions', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'Quang');
    expect(a.movePosition('aussen', 'mitte', 'Quang')).toBe(true);
    expect(a.positions.aussen).toEqual([]);
    expect(a.positions.mitte).toEqual(['Quang']);
  });

  it('movePosition rejects same source and target', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'Quang');
    expect(a.movePosition('aussen', 'aussen', 'Quang')).toBe(false);
  });

  it('isAssignedInPositions checks across all positions', () => {
    const a = makeStore();
    a.addToPosition('libero', 'Quang');
    expect(a.isAssignedInPositions('Quang')).toBe(true);
    expect(a.isAssignedInPositions('Nobody')).toBe(false);
  });

  it('isAssigned with mode=positions checks positions', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'A');
    a.addToSimple('B');
    expect(a.isAssigned('A', 'positions')).toBe(true);
    expect(a.isAssigned('B', 'positions')).toBe(false);
  });

  it('isAssigned with mode=simple checks simpleList', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'A');
    a.addToSimple('B');
    expect(a.isAssigned('A', 'simple')).toBe(false);
    expect(a.isAssigned('B', 'simple')).toBe(true);
  });

  it('setSimpleList dedups and trims', () => {
    const a = makeStore();
    a.setSimpleList(['Quang', '  Quang  ', '', 'Anh', 'Quang']);
    expect(a.simpleList).toEqual(['Quang', 'Anh']);
  });

  it('flattenPositionsToSimple unions all positions into simpleList', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'A');
    a.addToPosition('aussen', 'B');
    a.addToPosition('mitte', 'C');
    a.flattenPositionsToSimple();
    expect([...a.simpleList].sort()).toEqual(['A', 'B', 'C']);
  });

  it('clearAll resets positions and simpleList', () => {
    const a = makeStore();
    a.addToPosition('aussen', 'Q');
    a.addToSimple('A');
    a.clearAll();
    expect(a.countAssignedInPositions()).toBe(0);
    expect(a.simpleList.length).toBe(0);
  });

  it('persists positions to storage', () => {
    const storage = new FakeStorage();
    const a = new AssignmentsStore(storage);
    a.addToPosition('libero', 'Erik');
    const raw = storage.getItem(STORAGE_KEYS.assignments);
    expect(JSON.parse(raw!).libero).toEqual(['Erik']);
  });

  it('hydrates positions from storage', () => {
    const storage = new FakeStorage();
    storage.setItem(
      STORAGE_KEYS.assignments,
      JSON.stringify({ aussen: ['A', 'B'], mitte: ['C'], zuspieler: [], libero: [], diagonal: [] }),
    );
    const a = new AssignmentsStore(storage);
    expect(a.positions.aussen).toEqual(['A', 'B']);
    expect(a.positions.mitte).toEqual(['C']);
  });

  it('handles corrupt storage gracefully', () => {
    const storage = new FakeStorage();
    storage.setItem(STORAGE_KEYS.assignments, '{not json');
    const a = new AssignmentsStore(storage);
    expect(a.countAssignedInPositions()).toBe(0);
  });
});
