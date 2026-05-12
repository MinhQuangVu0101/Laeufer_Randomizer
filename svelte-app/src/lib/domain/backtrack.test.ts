import { describe, expect, it } from 'vitest';
import { assignBestEffort, assignToPositions } from './backtrack';
import type { PlayerWithPositions } from './types';

const p = (name: string, ...positions: PlayerWithPositions['positions']): PlayerWithPositions => ({
  name,
  positions,
});

describe('assignToPositions', () => {
  it('places one player per position (happy path)', () => {
    const result = assignToPositions(
      [p('A', 'aussen'), p('B', 'mitte'), p('C', 'zuspieler'), p('D', 'libero'), p('E', 'diagonal')],
      false,
    );
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen).toHaveLength(1);
    expect(result.team.mitte).toHaveLength(1);
    expect(result.team.zuspieler).toHaveLength(1);
    expect(result.team.libero).toHaveLength(1);
    expect(result.team.diagonal).toHaveLength(1);
  });

  it('respects position max (2 outside hitters)', () => {
    const result = assignToPositions([p('A', 'aussen'), p('B', 'aussen')], false);
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen.map((x) => x.name)).toEqual(['A', 'B']);
  });

  it('skips player when position is saturated and no alternative', () => {
    const result = assignToPositions([p('A', 'aussen'), p('B', 'aussen'), p('C', 'aussen')], false);
    expect(result.skipped.length).toBeGreaterThanOrEqual(1);
  });

  it('routes flex player to less-claimed position via backtracking', () => {
    const result = assignToPositions(
      [p('A', 'aussen'), p('B', 'aussen'), p('C', 'aussen', 'mitte')],
      false,
    );
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen).toHaveLength(2);
    expect(result.team.mitte.map((x) => x.name)).toEqual(['C']);
  });

  it('blocks libero placement when noLibero=true', () => {
    const result = assignToPositions([p('A', 'libero')], true);
    expect(result.skipped.map((x) => x.name)).toEqual(['A']);
    expect(result.team.libero).toHaveLength(0);
  });

  it('routes flex libero/aussen player to aussen when noLibero=true', () => {
    const result = assignToPositions([p('A', 'libero', 'aussen')], true);
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen.map((x) => x.name)).toEqual(['A']);
    expect(result.team.libero).toHaveLength(0);
  });

  it('returns empty team for empty input', () => {
    const result = assignToPositions([], false);
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen).toHaveLength(0);
  });

  it('skips player with empty positions array', () => {
    const result = assignToPositions([p('A')], false);
    expect(result.skipped.map((x) => x.name)).toEqual(['A']);
  });

  it('preserves preferences in assigned player', () => {
    const result = assignToPositions([p('A', 'aussen', 'mitte')], false);
    expect(result.team.aussen[0].preferences).toEqual(['aussen', 'mitte']);
    expect(result.team.aussen[0].position).toBe('aussen');
  });

  it('sorts by flex (less flexible first) so strict players get placed before flex ones', () => {
    const result = assignToPositions(
      [p('FlexAB', 'aussen', 'mitte'), p('StrictA', 'aussen'), p('StrictB', 'mitte')],
      false,
    );
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen.map((x) => x.name).sort()).toEqual(['FlexAB', 'StrictA']);
    expect(result.team.mitte.map((x) => x.name)).toEqual(['StrictB']);
  });

  it('rolls back team when no valid assignment exists (atomic failure)', () => {
    const result = assignToPositions([p('A', 'libero'), p('B', 'libero')], false);
    expect(result.skipped.map((x) => x.name).sort()).toEqual(['A', 'B']);
    expect(result.team.libero).toHaveLength(0);
  });

  it('rejects unknown position string defensively', () => {
    const bad = { name: 'X', positions: ['goalkeeper' as never] };
    const result = assignToPositions([bad], false);
    expect(result.skipped.map((x) => x.name)).toEqual(['X']);
  });
});

describe('assignBestEffort', () => {
  it('places everyone when strict assignment works', () => {
    const result = assignBestEffort(
      [p('A', 'aussen'), p('B', 'mitte'), p('C', 'zuspieler')],
      false,
    );
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen.map((x) => x.name)).toEqual(['A']);
    expect(result.team.mitte.map((x) => x.name)).toEqual(['B']);
    expect(result.team.zuspieler.map((x) => x.name)).toEqual(['C']);
  });

  it('overflows position max instead of skipping when no alternative', () => {
    const result = assignBestEffort([p('A', 'aussen'), p('B', 'aussen'), p('C', 'aussen')], false);
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen.map((x) => x.name).sort()).toEqual(['A', 'B', 'C']);
  });

  it('overflows liberos when only-libero players exceed max', () => {
    const result = assignBestEffort([p('L1', 'libero'), p('L2', 'libero')], false);
    expect(result.skipped).toHaveLength(0);
    expect(result.team.libero.map((x) => x.name).sort()).toEqual(['L1', 'L2']);
  });

  it('still skips pure libero when noLibero=true', () => {
    const result = assignBestEffort([p('L', 'libero')], true);
    expect(result.skipped.map((x) => x.name)).toEqual(['L']);
    expect(result.team.libero).toHaveLength(0);
  });

  it('routes flex player to less-loaded position', () => {
    const result = assignBestEffort(
      [p('A', 'aussen'), p('B', 'aussen'), p('C', 'aussen', 'mitte')],
      false,
    );
    expect(result.skipped).toHaveLength(0);
    expect(result.team.aussen).toHaveLength(2);
    expect(result.team.mitte.map((x) => x.name)).toEqual(['C']);
  });

  it('skips player with no valid positions', () => {
    const result = assignBestEffort([p('Ghost')], false);
    expect(result.skipped.map((x) => x.name)).toEqual(['Ghost']);
  });

  it('preserves preferences in placed players', () => {
    const result = assignBestEffort([p('A', 'aussen', 'mitte')], false);
    expect(result.team.aussen[0].preferences).toEqual(['aussen', 'mitte']);
  });
});
