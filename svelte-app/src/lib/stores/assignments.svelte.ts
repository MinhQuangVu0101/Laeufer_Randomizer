import { STORAGE_KEYS, POSITION_IDS, type Position, MODES, type Mode } from '../constants';
import { getDefaultStorage } from './storage';

export type AssignmentsState = {
  positions: Record<Position, string[]>;
  simpleList: string[];
};

function emptyPositions(): Record<Position, string[]> {
  return { aussen: [], mitte: [], zuspieler: [], libero: [], diagonal: [] };
}

function defaultState(): AssignmentsState {
  return { positions: emptyPositions(), simpleList: [] };
}

export class AssignmentsStore {
  private inner = $state<AssignmentsState>(defaultState());
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = getDefaultStorage()) {
    this.storage = storage;
    this.hydrate();
  }

  private hydrate() {
    if (!this.storage) return;
    try {
      const rawPositions = this.storage.getItem(STORAGE_KEYS.assignments);
      if (rawPositions) {
        const parsed = JSON.parse(rawPositions);
        if (parsed && typeof parsed === 'object') {
          for (const pos of POSITION_IDS) {
            const value = parsed[pos];
            if (Array.isArray(value)) {
              this.inner.positions[pos] = value
                .filter((x): x is string => typeof x === 'string')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
            }
          }
        }
      }
    } catch {
      // corrupt → keep defaults
    }
  }

  private persist() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEYS.assignments, JSON.stringify(this.inner.positions));
    } catch {
      // ignore
    }
  }

  get positions(): Readonly<Record<Position, string[]>> {
    return this.inner.positions;
  }

  get simpleList(): readonly string[] {
    return this.inner.simpleList;
  }

  isAssignedInPositions(name: string): boolean {
    for (const pos of POSITION_IDS) {
      if (this.inner.positions[pos].includes(name)) return true;
    }
    return false;
  }

  isAssignedInSimple(name: string): boolean {
    return this.inner.simpleList.includes(name);
  }

  isAssigned(name: string, mode: Mode): boolean {
    return mode === MODES.positions ? this.isAssignedInPositions(name) : this.isAssignedInSimple(name);
  }

  countAssignedInPositions(): number {
    let total = 0;
    for (const pos of POSITION_IDS) total += this.inner.positions[pos].length;
    return total;
  }

  addToPosition(pos: Position, name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (this.inner.positions[pos].includes(trimmed)) return false;
    this.inner.positions[pos].push(trimmed);
    this.persist();
    return true;
  }

  removeFromPosition(pos: Position, name: string): boolean {
    const idx = this.inner.positions[pos].indexOf(name);
    if (idx === -1) return false;
    this.inner.positions[pos].splice(idx, 1);
    this.persist();
    return true;
  }

  movePosition(from: Position, to: Position, name: string): boolean {
    if (from === to) return false;
    const idx = this.inner.positions[from].indexOf(name);
    if (idx === -1) return false;
    if (this.inner.positions[to].includes(name)) return false;
    this.inner.positions[from].splice(idx, 1);
    this.inner.positions[to].push(name);
    this.persist();
    return true;
  }

  setSimpleList(names: readonly string[]) {
    const cleaned = names
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const deduped = [...new Set(cleaned)];
    this.inner.simpleList = deduped;
    this.persist();
  }

  addToSimple(name: string): boolean {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (this.inner.simpleList.includes(trimmed)) return false;
    this.inner.simpleList.push(trimmed);
    this.persist();
    return true;
  }

  removeFromSimple(name: string): boolean {
    const idx = this.inner.simpleList.indexOf(name);
    if (idx === -1) return false;
    this.inner.simpleList.splice(idx, 1);
    this.persist();
    return true;
  }

  clearAll() {
    this.inner.positions = emptyPositions();
    this.inner.simpleList = [];
    this.persist();
  }

  flattenPositionsToSimple() {
    const flat = new Set<string>();
    for (const pos of POSITION_IDS) {
      for (const name of this.inner.positions[pos]) flat.add(name);
    }
    this.inner.simpleList = [...flat];
    this.persist();
  }
}

export const assignments = new AssignmentsStore();
