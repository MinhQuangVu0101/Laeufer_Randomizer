import {
  STORAGE_KEYS,
  DEFAULT_TEAM_SIZE,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
  MODES,
  type Mode,
} from '../constants';
import { getDefaultStorage } from './storage';

export type Theme = 'light' | 'dark';
export type Lang = 'de' | 'en';

export type Settings = {
  mode: Mode;
  theme: Theme;
  lang: Lang;
  teamSize: number;
  team1NoLibero: boolean;
  team2NoLibero: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  mode: MODES.positions,
  theme: 'dark',
  lang: 'de',
  teamSize: DEFAULT_TEAM_SIZE,
  team1NoLibero: true,
  team2NoLibero: true,
};

function clampTeamSize(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n)) return DEFAULT_TEAM_SIZE;
  const rounded = Math.floor(n);
  if (rounded < MIN_TEAM_SIZE) return MIN_TEAM_SIZE;
  return Math.min(rounded, MAX_TEAM_SIZE);
}

export class SettingsStore {
  private inner = $state<Settings>({ ...DEFAULT_SETTINGS });
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = getDefaultStorage()) {
    this.storage = storage;
    this.hydrate();
  }

  private hydrate() {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(STORAGE_KEYS.settings);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.mode === 'positions' || parsed.mode === 'simple') this.inner.mode = parsed.mode;
        if (parsed.theme === 'light' || parsed.theme === 'dark') this.inner.theme = parsed.theme;
        if (parsed.lang === 'de' || parsed.lang === 'en') this.inner.lang = parsed.lang;
        if (typeof parsed.teamSize === 'number') this.inner.teamSize = clampTeamSize(parsed.teamSize);
        if (typeof parsed.team1NoLibero === 'boolean') this.inner.team1NoLibero = parsed.team1NoLibero;
        if (typeof parsed.team2NoLibero === 'boolean') this.inner.team2NoLibero = parsed.team2NoLibero;
      }
    } catch {
      // corrupt JSON → keep defaults
    }
  }

  private persist() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.inner));
    } catch {
      // quota exceeded or storage disabled — silently drop
    }
  }

  get mode(): Mode {
    return this.inner.mode;
  }
  set mode(v: Mode) {
    this.inner.mode = v;
    this.persist();
  }

  get theme(): Theme {
    return this.inner.theme;
  }
  set theme(v: Theme) {
    this.inner.theme = v;
    this.persist();
  }

  get lang(): Lang {
    return this.inner.lang;
  }
  set lang(v: Lang) {
    this.inner.lang = v;
    this.persist();
  }

  get teamSize(): number {
    return this.inner.teamSize;
  }
  set teamSize(v: number) {
    this.inner.teamSize = clampTeamSize(v);
    this.persist();
  }

  get team1NoLibero(): boolean {
    return this.inner.team1NoLibero;
  }
  set team1NoLibero(v: boolean) {
    this.inner.team1NoLibero = v;
    this.persist();
  }

  get team2NoLibero(): boolean {
    return this.inner.team2NoLibero;
  }
  set team2NoLibero(v: boolean) {
    this.inner.team2NoLibero = v;
    this.persist();
  }
}

export const settings = new SettingsStore();
