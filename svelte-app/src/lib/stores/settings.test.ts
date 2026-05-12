import { describe, expect, it } from 'vitest';
import { SettingsStore } from './settings.svelte';
import { FakeStorage } from '../test-utils/fake-storage';
import { STORAGE_KEYS } from '../constants';

const makeStore = () => new SettingsStore(new FakeStorage());

describe('SettingsStore', () => {
  describe('defaults', () => {
    it('boots with positions mode by default', () => {
      const s = makeStore();
      expect(s.mode).toBe('positions');
    });

    it('boots with dark theme by default', () => {
      const s = makeStore();
      expect(s.theme).toBe('dark');
    });

    it('boots with teamSize=6 by default', () => {
      const s = makeStore();
      expect(s.teamSize).toBe(6);
    });

    it('boots with lang=de by default', () => {
      const s = makeStore();
      expect(s.lang).toBe('de');
    });
  });

  describe('teamSize clamping', () => {
    it('clamps 0 to MIN_TEAM_SIZE=1', () => {
      const s = makeStore();
      s.teamSize = 0;
      expect(s.teamSize).toBe(1);
    });

    it('clamps -5 to MIN_TEAM_SIZE=1', () => {
      const s = makeStore();
      s.teamSize = -5;
      expect(s.teamSize).toBe(1);
    });

    it('clamps 15 to MAX_TEAM_SIZE=12', () => {
      const s = makeStore();
      s.teamSize = 15;
      expect(s.teamSize).toBe(12);
    });

    it('clamps NaN to DEFAULT_TEAM_SIZE=6', () => {
      const s = makeStore();
      s.teamSize = Number.NaN;
      expect(s.teamSize).toBe(6);
    });

    it('clamps Infinity to DEFAULT_TEAM_SIZE=6', () => {
      const s = makeStore();
      s.teamSize = Number.POSITIVE_INFINITY;
      expect(s.teamSize).toBe(6);
    });

    it('floors decimal values (6.7 → 6)', () => {
      const s = makeStore();
      s.teamSize = 6.7;
      expect(s.teamSize).toBe(6);
    });
  });

  describe('persistence', () => {
    it('writes to storage on mode change', () => {
      const storage = new FakeStorage();
      const s = new SettingsStore(storage);
      s.mode = 'simple';
      const raw = storage.getItem(STORAGE_KEYS.settings);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).mode).toBe('simple');
    });

    it('writes clamped teamSize to storage', () => {
      const storage = new FakeStorage();
      const s = new SettingsStore(storage);
      s.teamSize = 100;
      const raw = storage.getItem(STORAGE_KEYS.settings);
      expect(JSON.parse(raw!).teamSize).toBe(12);
    });

    it('hydrates from storage on construction', () => {
      const storage = new FakeStorage();
      storage.setItem(
        STORAGE_KEYS.settings,
        JSON.stringify({ mode: 'simple', theme: 'light', teamSize: 4, lang: 'en' }),
      );
      const s = new SettingsStore(storage);
      expect(s.mode).toBe('simple');
      expect(s.theme).toBe('light');
      expect(s.teamSize).toBe(4);
      expect(s.lang).toBe('en');
    });

    it('hydrate clamps invalid stored teamSize', () => {
      const storage = new FakeStorage();
      storage.setItem(STORAGE_KEYS.settings, JSON.stringify({ teamSize: 999 }));
      const s = new SettingsStore(storage);
      expect(s.teamSize).toBe(12);
    });

    it('ignores corrupt JSON and falls back to defaults', () => {
      const storage = new FakeStorage();
      storage.setItem(STORAGE_KEYS.settings, '{not valid');
      const s = new SettingsStore(storage);
      expect(s.teamSize).toBe(6);
      expect(s.mode).toBe('positions');
    });

    it('rejects unknown mode values during hydrate', () => {
      const storage = new FakeStorage();
      storage.setItem(STORAGE_KEYS.settings, JSON.stringify({ mode: 'rocket-league' }));
      const s = new SettingsStore(storage);
      expect(s.mode).toBe('positions');
    });
  });

  describe('libero settings', () => {
    it('sets team1NoLibero', () => {
      const s = makeStore();
      s.team1NoLibero = true;
      expect(s.team1NoLibero).toBe(true);
    });

    it('sets team2NoLibero independently', () => {
      const s = makeStore();
      s.team1NoLibero = true;
      s.team2NoLibero = false;
      expect(s.team1NoLibero).toBe(true);
      expect(s.team2NoLibero).toBe(false);
    });
  });
});
